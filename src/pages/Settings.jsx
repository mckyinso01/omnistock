import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, AlertTriangle, Moon, Sun, Monitor } from "lucide-react";

export default function Settings() {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  const handleDeleteAccount = async () => {
    if (confirmText !== "DELETE") return;
    setDeleting(true);
    try {
      const user = await base44.auth.me();
      await base44.entities.User.delete(user.id);
      base44.auth.logout("/");
    } catch (e) {
      setDeleting(false);
      alert("Failed to delete account. Please try again.");
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Settings</h1>
        <p className="text-sm text-slate-500 mt-0.5">Manage your account preferences.</p>
      </div>

      {/* Theme — just info, auto-synced via system */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Monitor className="w-4 h-4 text-slate-500" />
            Appearance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-500">
            The app automatically follows your device's system theme (Light / Dark Mode).
          </p>
          <div className="flex items-center gap-3 mt-3 text-slate-400 text-xs">
            <Sun className="w-4 h-4" /> Light &nbsp;·&nbsp; <Moon className="w-4 h-4" /> Dark — synced automatically
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border border-red-200 bg-red-50/30 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold text-red-600 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Danger Zone
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-600 mb-4">
            Permanently delete your account and all associated data. This action cannot be undone.
          </p>
          <Button
            variant="destructive"
            className="gap-2"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="w-4 h-4" />
            Delete Account
          </Button>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      {showDeleteDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h2 className="font-bold text-slate-800">Delete Account</h2>
                <p className="text-xs text-slate-500">This cannot be undone.</p>
              </div>
            </div>
            <p className="text-sm text-slate-600">
              Type <span className="font-bold text-red-600">DELETE</span> to confirm:
            </p>
            <input
              className="w-full rounded-md border border-input px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-red-400"
              placeholder="Type DELETE"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
            />
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => { setShowDeleteDialog(false); setConfirmText(""); }}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                disabled={confirmText !== "DELETE" || deleting}
                onClick={handleDeleteAccount}
              >
                {deleting ? "Deleting..." : "Delete Account"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}