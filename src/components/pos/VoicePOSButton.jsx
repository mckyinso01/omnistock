import { useState, useRef, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Loader2, Sparkles } from "lucide-react";

/**
 * VoicePOSButton — Voice-assisted POS entry.
 * Uses the Web Speech API for transcription, then InvokeLLM to parse
 * natural language into structured cart items, which are matched against
 * the product list and added to the cart.
 */
export default function VoicePOSButton({ products, onAddToCart }) {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState(null);
  const recognitionRef = useRef(null);

  const startListening = useCallback(() => {
    setError(null);
    setTranscript("");

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError("Voice recognition not supported in this browser. Try Chrome or Edge.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = async (event) => {
      let finalTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        finalTranscript += event.results[i][0].transcript;
      }
      setTranscript(finalTranscript);

      if (event.results[event.results.length - 1].isFinal) {
        await parseAndAdd(finalTranscript);
      }
    };

    recognition.onerror = (event) => {
      setError("Voice error: " + event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  }, []);

  const parseAndAdd = async (text) => {
    if (!text.trim()) return;
    setIsProcessing(true);
    setError(null);

    try {
      const productNames = products.map(p => ({
        name: p.name,
        sku: p.sku,
        price: p.price,
      }));

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a POS assistant. Parse this voice command into a list of cart items.
Match spoken product names to the closest product from this catalog:
${JSON.stringify(productNames)}

Voice command: "${text}"

Return a JSON array of items, each with:
- "product_name": the matched product name (exact match from catalog)
- "quantity": the number requested (default 1)

Only include items that match a catalog product. If no match, return empty array.

Examples:
"add 3 coffee and 1 sandwich" → [{"product_name":"<matched coffee>","quantity":3},{"product_name":"<matched sandwich>","quantity":1}]
"two milks" → [{"product_name":"<matched milk>","quantity":2}]`,
        response_json_schema: {
          type: "object",
          properties: {
            items: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  product_name: { type: "string" },
                  quantity: { type: "number" },
                },
              },
            },
          },
        },
      });

      const parsed = response?.items || [];
      let added = 0;
      for (const item of parsed) {
        const match = products.find(
          p => p.name === item.product_name ||
          p.name?.toLowerCase().includes(item.product_name?.toLowerCase() || "")
        );
        if (match && item.quantity > 0) {
          for (let i = 0; i < item.quantity; i++) {
            onAddToCart(match);
          }
          added++;
        }
      }

      if (added === 0) {
        setError("No matching products found for: " + text);
      }
      setTranscript("");
    } catch (err) {
      setError("Failed to parse voice input: " + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <Button
        onClick={isListening ? stopListening : startListening}
        disabled={isProcessing}
        variant={isListening ? "destructive" : "outline"}
        className={`gap-2 ${isListening ? "animate-pulse" : ""}`}
        size="sm"
      >
        {isProcessing ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : isListening ? (
          <MicOff className="w-4 h-4" />
        ) : (
          <Mic className="w-4 h-4" />
        )}
        {isProcessing ? "Parsing..." : isListening ? "Listening..." : "Voice Add"}
      </Button>

      {isListening && transcript && (
        <div className="text-xs text-cyan-300 font-mono bg-cyan-950/30 border border-cyan-800/40 rounded-lg p-2 italic">
          "{transcript}"
        </div>
      )}

      {error && (
        <div className="text-xs text-rose-400 bg-rose-950/30 border border-rose-800/40 rounded-lg p-2">
          {error}
        </div>
      )}
    </div>
  );
}