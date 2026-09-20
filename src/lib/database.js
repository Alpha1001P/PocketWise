import { supabase } from "./supabase";

// ========================================
// ACCOUNTS
// ========================================

export async function getAccounts() {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      data: [],
      error: userError || new Error("User not logged in"),
    };
  }

  const { data, error } = await supabase
    .from("accounts")
    .select("*")
    .eq("user_id", user.id);

  return {
    data: data || [],
    error,
  };
}

export async function createAccount(account) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      data: null,
      error: userError || new Error("User not logged in"),
    };
  }

  const { data, error } = await supabase
    .from("accounts")
    .insert([
      {
        user_id: user.id,
        name: account.name,
        type: account.type || null,
        balance: Number(account.balance) || 0,
        icon: account.icon || "💵",
        monthly_budget: Number(account.monthlyBudget) || 0,
      },
    ])
    .select()
    .single();

  return {
    data,
    error,
  };
}

export async function updateAccount(id, account) {
  const { data, error } = await supabase
    .from("accounts")
    .update({
      name: account.name,
      type: account.type || null,
      balance: Number(account.balance) || 0,
      icon: account.icon || "💵",
      monthly_budget: Number(account.monthlyBudget) || 0,
    })
    .eq("id", id)
    .select()
    .single();

  return {
    data,
    error,
  };
}

export async function deleteAccount(id) {
  const { error } = await supabase
    .from("accounts")
    .delete()
    .eq("id", id);

  return {
    error,
  };
}


// ========================================
// TRANSACTIONS
// ========================================

export async function getTransactions() {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      data: [],
      error: userError || new Error("User not logged in"),
    };
  }

  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", user.id)
    .order("date", {
      ascending: false,
    });

  console.log("CURRENT USER:", user.id);
  console.log("SUPABASE TRANSACTIONS:", data);
  console.log("SUPABASE TRANSACTION ERROR:", error);

  return {
    data: data || [],
    error,
  };
}


// ========================================
// CREATE TRANSACTION
// ========================================

export async function createTransaction(transaction) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      data: null,
      error: userError || new Error("User not logged in"),
    };
  }

  const { data, error } = await supabase
    .from("transactions")
    .insert([
      {
        user_id: user.id,
        account_id: transaction.account_id || null,
        account: transaction.account || null,
        type: transaction.type,
        amount: Number(transaction.amount) || 0,
        category: transaction.category || null,
        description: transaction.description || null,
        date: transaction.date || new Date().toISOString(),
      },
    ])
    .select()
    .single();

  return {
    data,
    error,
  };
}


// ========================================
// UPDATE TRANSACTION
// ========================================

export async function updateTransaction(id, transaction) {
  const { data, error } = await supabase
    .from("transactions")
    .update({
      account_id: transaction.account_id || null,
      account: transaction.account || null,
      type: transaction.type,
      amount: Number(transaction.amount) || 0,
      category: transaction.category || null,
      description: transaction.description || null,
      date: transaction.date || new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  return {
    data,
    error,
  };
}


// ========================================
// DELETE TRANSACTION
// ========================================

export async function deleteTransaction(id) {
  const { error } = await supabase
    .from("transactions")
    .delete()
    .eq("id", id);

  return {
    error,
  };
}


// ========================================
// USER SETTINGS / BUDGET
// ========================================

export async function getUserSettings() {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      data: null,
      error: userError || new Error("User not logged in"),
    };
  }

  const { data, error } = await supabase
    .from("user_settings")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  return {
    data,
    error,
  };
}


// ========================================
// SAVE USER SETTINGS
// ========================================

export async function saveUserSettings(settings) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      data: null,
      error: userError || new Error("User not logged in"),
    };
  }

  const { data, error } = await supabase
    .from("user_settings")
    .upsert(
      {
        user_id: user.id,
        monthly_budget: Number(settings.monthly_budget) || 0,
        currency: settings.currency || "INR",
        notifications_enabled:
          settings.notifications_enabled !== false,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id",
      }
    )
    .select()
    .single();

  return {
    data,
    error,
  };
}