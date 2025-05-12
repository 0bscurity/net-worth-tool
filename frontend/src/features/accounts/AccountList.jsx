import { mockAccounts } from "./data";
import AccountCard from "./AccountCard";

export default function AccountList() {
  if (mockAccounts.length === 0) return <p>No accounts added yet.</p>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {mockAccounts.map((acc) => (
        <AccountCard key={acc.id} account={acc} />
      ))}
    </div>
  );
}
