import React, { useEffect, useState } from "react";
import { Card, CardContent } from "../ui/card";
import { User } from "lucide-react";
import useFetchAllRecords from "./utils/useFetchAllRecords";
import { fetchAndDecryptFiles } from "@/utils/encryption";
import { useParams } from "react-router";
import ImageSlider from "./components/image-slider";
import GrantRevokeAccess from "./GrantRevokeAccess";

type MedicalRecordProps = {
  patient: {
    name: string;
    age: number;
    gender: string;
  };
  summary: {
    conditions: string[];
    allergies: string[];
    medications: string[];
  };
  vitals: {
    bloodPressure: string;
    heartRate: string;
    temperature: string;
  };
  recentVisit: {
    date: string;
    reason: string;
    notes: string;
  };
  labResult: {
    testName: string;
    result: string;
    date: string;
  };
  prescription: {
    name: string;
    dosage: string;
    prescribedDate: string;
  };
  nextAppointment?: {
    date: string;
    doctor: string;
  };
};

const mockData = {
  patient: {
    name: "John Doe",
    age: 30,
    gender: "Male",
  },
  summary: {
    conditions: ["Hypertension"],
    allergies: ["Penicillin"],
    medications: ["Aspirin"],
  },
  vitals: {
    bloodPressure: "120/80",
    heartRate: "72 bpm",
    temperature: "98.6°F",
  },
  recentVisit: {
    date: "2025-04-10",
    reason: "Routine check-up",
    notes: "Patient is in good health.",
  },
  labResult: {
    testName: "Blood Test",
    result: "Normal",
    date: "2025-04-09",
  },
  prescription: {
    name: "Vitamin D",
    dosage: "5000 IU daily",
    prescribedDate: "2025-04-10",
  },
  nextAppointment: {
    date: "2025-05-10",
    doctor: "Dr. Smith",
  },
};

export const RecordDetail: React.FC<Partial<MedicalRecordProps>> = (props) => {
  const { summary, recentVisit, labResult, prescription, nextAppointment } = {
    ...mockData,
    ...props,
  };

  const { records } = useFetchAllRecords();
  const { recordID } = useParams();

  const currentRecord = records.find((rec) => rec.id === recordID);

  const [decryptedImageUrls, setDecryptedImageUrls] = useState<{
    [key: string]: string[];
  }>({});

  useEffect(() => {
    if (!currentRecord) return;

    const decryptImages = async () => {
      const secretKey = import.meta.env.VITE_SECRET_KEY;

      const newDecryptedImageUrls: { [key: string]: string[] } = {};

      const decryptedFiles = await fetchAndDecryptFiles(
        currentRecord.cids,
        secretKey
      );
      newDecryptedImageUrls[currentRecord.id] = decryptedFiles;

      setDecryptedImageUrls(newDecryptedImageUrls);
    };

    if (currentRecord.cids.length > 0) {
      decryptImages();
    }
  }, [currentRecord]);

  if (!currentRecord || !decryptedImageUrls[currentRecord.id] || !recordID) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex gap-10 justify-center">
      <Card className="basis-2/3 flex-1 p-4 rounded-2xl mt-24 mb-10 shadow-md w-full max-w-xl ">
        <CardContent className="space-y-4">
          <div className="text-xl font-semibold flex items-center gap-2">
            <User className="w-5 h-5" />
            {currentRecord?.patientName}, {currentRecord?.patientAge} (
            {currentRecord?.patientGender})
          </div>

          <div className="space-y-1">
            <h3 className="text-base font-medium">🩺 Summary</h3>
            <p>
              <strong>Conditions:</strong> {summary.conditions.join(", ")}
            </p>
            <p>
              <strong>Allergies:</strong> {summary.allergies.join(", ")}
            </p>
            <p>
              <strong>Medications:</strong> {summary.medications.join(", ")}
            </p>
          </div>

          <div className="space-y-1">
            <h3 className="text-base font-medium">❤️ Vitals</h3>
            <p>Blood Pressure: {currentRecord?.vitals.bloodPressure}</p>
            <p>Heart Rate: {currentRecord?.vitals.heartRate}</p>
            <p>Temperature: {currentRecord?.vitals.temperature}</p>
          </div>

          <div className="space-y-1">
            <h3 className="text-base font-medium">📋 Recent Visit</h3>
            <p>Date: {recentVisit.date}</p>
            <p>Reason: {recentVisit.reason}</p>
            <p>Notes: {recentVisit.notes}</p>
          </div>

          <div className="space-y-1">
            <h3 className="text-base font-medium">🧪 Lab Result</h3>
            <p>
              {labResult.testName} - {labResult.result} ({labResult.date})
            </p>
          </div>

          <div className="space-y-1">
            <h3 className="text-base font-medium">💊 Prescription</h3>
            <p>
              {prescription.name} ({prescription.dosage}) -{" "}
              {prescription.prescribedDate}
            </p>
          </div>

          {nextAppointment && (
            <div className="space-y-1">
              <h3 className="text-base font-medium">📅 Next Appointment</h3>
              <p>
                {nextAppointment.date} with Dr. {nextAppointment.doctor}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
      <div className="flex flex-col mt-24 basis-1/3 justify-between pb-10">
        <ImageSlider
          images={decryptedImageUrls[currentRecord.id] || []}
          title="Medical Images"
        />
        <GrantRevokeAccess recordId={recordID} />
      </div>
    </div>
  );
};
