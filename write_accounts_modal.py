import re

# Read current file
with open('Atlas-V1.0/src/pages/AdminUsersPro.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Find and replace the MemberAccount interface to add more fields
old_iface = """interface MemberAccount {
  id: number; account_number: string; balance: number;
  portfolio: string; is_active: boolean;
}"""

new_iface = """interface MemberAccount {
  id: number;
  account_number: string;
  balance: number;
  shares_count: number;
  gross_value: number;
  member_external_id: string | null;
  portfolio: string;
  portfolio_type: string;
  is_active: boolean;
}"""

content = content.replace(old_iface, new_iface)

# Add accountForm state after loadingAccounts state
old_state = "  const [loadingAccounts, setLoadingAccounts] = useState(false);"
new_state = """  const [loadingAccounts, setLoadingAccounts] = useState(false);
  const [editingAccount, setEditingAccount] = useState<MemberAccount | null>(null);
  const [accountForm, setAccountForm] = useState({ balance: '', shares_count: '', gross_value: '', member_external_id: '' });
  const [savingAccount, setSavingAccount] = useState(false);"""

content = content.replace(old_state, new_state)

with open('Atlas-V1.0/src/pages/AdminUsersPro.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print('Interface and state updated')
