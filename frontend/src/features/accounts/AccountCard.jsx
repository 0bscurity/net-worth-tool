export default function AccountCard({ account }) {
  const { institution, type, balance, interest } = account;

  return (
    <div className="card bg-base-100 shadow-md p-4">
      <h3 className="text-lg font-semibold">{institution}</h3>
      <p>Type: {type}</p>
      <p>Balance: ${balance.toLocaleString()}</p>
      {interest > 0 && <p>Interest: {(interest * 100).toFixed(2)}%</p>}
    </div>
  );
}
