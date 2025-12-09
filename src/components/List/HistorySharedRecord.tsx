import useFetchAllHistory from "./utils/useFetchHistory";

export default function HistorySharedRecord() {
  const { history, loading, error } = useFetchAllHistory();

  if (loading) return <div>Loading full history...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">All Shared Records</h2>

      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-100 border-b">
            <th className="p-3">Record ID</th>
            <th className="p-3">Patient Name</th>
            <th className="p-3">Shared With (Doctor)</th>
            <th className="p-3">Date</th>
            <th className="p-3">Duration</th>
            <th className="p-3">Status</th>
          </tr>
        </thead>
        <tbody>
          {history.map((item, idx) => (
            <tr key={idx} className="border-b hover:bg-gray-50">
              <td className="p-3 text-blue-600 font-mono text-sm">
                {item.recordId}
              </td>
              <td className="p-3 font-medium">{item.patientName}</td>
              <td className="p-3 font-mono text-sm text-gray-600">
                {item.doctorAddress}
              </td>
              <td className="p-3 text-sm">{item.sharedDate}</td>
              <td className="p-3 text-sm">{item.duration}</td>
              <td className="p-3">
                <span
                  className={`px-2 py-1 rounded text-xs font-bold ${
                    item.status === "Active"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {item.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {history.length === 0 && (
        <p className="text-center p-4 text-gray-500">
          No sharing history found.
        </p>
      )}
    </div>
  );
}
