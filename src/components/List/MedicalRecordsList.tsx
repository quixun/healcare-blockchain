import React, { useEffect, useState } from "react";
import { ethers } from "ethers";

const contractAddress = "0x5088bf0ba8eAa0f83286921047c896F8d6A97490"; // Deployed contract address
const MEDICAL_RECORDS_ABI = [
  {
    inputs: [],
    name: "getRecords",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  // Add other functions like addRecord, grantAccess, etc. as needed
];

const MedicalRecordsList: React.FC = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // useEffect hook to call async function
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Setup provider to connect to Ganache
        const provider = new ethers.JsonRpcProvider("http://127.0.0.1:7545"); // Ganache's RPC URL
        const signer = await provider.getSigner(0); // Get signer from Ganache (first account)

        // Get the contract instance
        const MedicalRecords = new ethers.Contract(
          contractAddress,
          MEDICAL_RECORDS_ABI,
          signer
        );

        // Example: Call a function from the contract, like getting records
        const recordsData = await MedicalRecords.getRecords(
          "0xYourPatientAddress"
        ); // Replace with actual patient address
        setRecords(recordsData);
      } catch (error) {
        setError("Error interacting with contract: " + error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []); // Empty dependency array ensures it runs once on mount

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      <h1>Medical Records</h1>
      <ul>
        {records.map((record: string, index: number) => (
          <li key={index}>{record}</li>
        ))}
      </ul>
    </div>
  );
};

export default MedicalRecordsList;
