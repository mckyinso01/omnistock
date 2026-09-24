import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { entities, migrateToMultiBranch } from '@/lib/db';

const BranchContext = createContext();

const STORAGE_KEY = 'omnistock_active_branch_id';

export const BranchProvider = ({ children }) => {
  const [branches, setBranches] = useState([]);
  const [organization, setOrganization] = useState(null);
  const [activeBranchId, setActiveBranchId] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshBranches = useCallback(async () => {
    try {
      const allBranches = await entities.Branch.list('-created_date', 500);
      setBranches(allBranches || []);
      return allBranches || [];
    } catch (err) {
      console.error('BranchContext refresh error:', err);
      setBranches([]);
      return [];
    }
  }, []);

  const refreshOrganization = useCallback(async () => {
    try {
      const orgs = await entities.Organization.list('-created_date', 10);
      const org = orgs && orgs[0] ? orgs[0] : null;
      setOrganization(org);
      return org;
    } catch (err) {
      console.error('BranchContext org load error:', err);
      setOrganization(null);
      return null;
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      // Run migration first to ensure Main Branch + Organization exist
      await migrateToMultiBranch();
      const allBranches = await refreshBranches();
      const org = await refreshOrganization();

      // Restore active branch from sessionStorage or default to first/Main
      const stored = sessionStorage.getItem(STORAGE_KEY);
      let branchId = stored;
      if (!branchId && allBranches.length > 0) {
        const mainBranch = allBranches.find(b => b.code === 'MAIN') || allBranches[0];
        branchId = mainBranch.id;
      }
      if (branchId) {
        sessionStorage.setItem(STORAGE_KEY, branchId);
      }
      setActiveBranchId(branchId);
      setLoading(false);
    };
    init();
  }, [refreshBranches, refreshOrganization]);

  const setActiveBranch = useCallback((branchId) => {
    setActiveBranchId(branchId);
    if (branchId) {
      sessionStorage.setItem(STORAGE_KEY, branchId);
    } else {
      sessionStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const activeBranch = branches.find(b => b.id === activeBranchId) || null;
  const multiBranchEnabled = organization?.multi_branch_enabled || false;
  const showBranchSelector = branches.length > 1 || multiBranchEnabled;

  return (
    <BranchContext.Provider value={{
      branches,
      activeBranch,
      activeBranchId,
      setActiveBranchId: setActiveBranch,
      organization,
      multiBranchEnabled,
      showBranchSelector,
      loading,
      refreshBranches,
      refreshOrganization,
    }}>
      {children}
    </BranchContext.Provider>
  );
};

export const useBranch = () => {
  const context = useContext(BranchContext);
  if (!context) {
    throw new Error('useBranch must be used within a BranchProvider');
  }
  return context;
};