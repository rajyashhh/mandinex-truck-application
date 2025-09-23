"use client";

import React, { useState, useEffect } from "react";
import { motion, Transition } from "framer-motion";
import {
  Car,
  CreditCard,
  Package,
  User,
  Upload,
  Check,
  FileText,
  MapPin,
  PackageIcon,
  Phone,
  Truck,
} from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Image from "next/image";

// ✅ Typed InputWithIcon
const InputWithIcon = ({
  id,
  label,
  type = "text",
  icon: Icon,
  value,
  onChange,
}: {
  id: string;
  label: string;
  type?: string;
  icon: React.ElementType;
  value: string;
  onChange: (val: string) => void;
}) => (
  <div className="relative">
    <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
    <input
      type={type}
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={label}
      className="peer w-full p-4 pl-10 border border-gray-300 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:border-[#146551] focus:ring-1 focus:ring-[#146551] transition-all duration-200"
    />
  </div>
);

export default function InsuranceForm() {
  const router = useRouter();

  // core states
  const [step, setStep] = useState<number>(0);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [savedPolicyData, setSavedPolicyData] = useState<any>(null);

  // ---- Payment / upload states required by STEP 6 ----
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const [paid, setPaid] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // form fields
  const [formData, setFormData] = useState({
    vehicleNumber: "",
    driverLicense: "",
    vehicleTonnage: "",
    vehiclePermit: "",
    origin: "",
    destination: "",
    supplierName: "",
    supplierFirm: "",
    goodsType: "",
    amountValue: "",
    lastEmiPaid: "",
  });

  // other uploaded documents used earlier in flow
  const [files, setFiles] = useState<{
    vehicleImage: File | null;
    weightmentSlip: File | null;
    rcDocument: File | null;
    licenseImage: File | null;
    vehiclePermit: File | null;
  }>({
    vehicleImage: null,
    weightmentSlip: null,
    rcDocument: null,
    licenseImage: null,
    vehiclePermit: null,
  });

  useEffect(() => {
    const timer = setTimeout(() => setStep(1), 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleChange = (field: keyof typeof formData, value: string) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const handleFileChange = (field: keyof typeof files, file: File | null) =>
    setFiles((prev) => ({ ...prev, [field]: file }));

  // ---------- Save insurance data (JSON) ----------
  const saveInsuranceData = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/insurance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      // try to parse JSON even on error
      const text = await response.text();
      let result: any = null;
      try {
        result = text ? JSON.parse(text) : null;
      } catch (e) {
        result = { error: text || "Unknown server response" };
      }

      if (!response.ok) {
        console.error("Save insurance API error:", response.status, result);
        throw new Error(result?.error || `Failed to save insurance data (status ${response.status})`);
      }

      setSavedPolicyData(result.data ?? result);
      return true;
    } catch (err: any) {
      console.error("Error saving insurance data:", err);
      toast.error("Failed to save insurance data. Please try again.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // ---------- generate invoice ----------
  const generateInvoice = async () => {
    try {
      const response = await fetch("/api/generate-invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vehicleNumber: formData.vehicleNumber,
          driverLicense: formData.driverLicense,
          vehicleTonnage: formData.vehicleTonnage,
          origin: formData.origin,
          destination: formData.destination,
          supplierName: formData.supplierName,
          goodsType: formData.goodsType,
          amountValue: formData.amountValue,
          policyNumber: savedPolicyData?.policyNumber || "INV" + Date.now(),
        }),
      });

      if (!response.ok) {
        const t = await response.text();
        console.error("Invoice generation failed:", response.status, t);
        throw new Error("Invoice generation failed");
      }

      const result = await response.json();
      // server returns { html: "<html>..</html>", invoiceNumber: "INV1234" }
      const blob = new Blob([result.html], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);

      if (savedPolicyData) {
        setSavedPolicyData({
          ...savedPolicyData,
          invoiceNumber: result.invoiceNumber,
        });
      }
    } catch (err) {
      console.error("Failed to generate invoice:", err);
      toast.error("Invoice generation failed.");
    }
  };

  // ---------- unified next handler ----------
  const handleNext = async () => {
    // Skip validation for step 0 (loading step)
    if (step === 0) {
      setStep(step + 1);
      return;
    }

    // Save data when moving from step 3 to 4
    if (step === 3) {
      const saved = await saveInsuranceData();
      if (!saved) return; // don't proceed if save failed
    }

    // Generate invoice when moving to step 5
    if (step === 4) {
      await generateInvoice();
    }

    setStep((s) => Math.min(s + 1, 7));
  };

  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  const insuranceCost = formData.amountValue ? (parseFloat(formData.amountValue) / 100000) * 200 : 0;

  // ---------- PAYMENT: upload + submit ----------
  const handleUploadChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
    const file = ev.target.files?.[0] ?? null;
    if (!file) return;
    // validate size (optional)
    const maxMB = 5;
    if (file.size > maxMB * 1024 * 1024) {
      toast.error(`File too large. Max ${maxMB}MB allowed.`);
      ev.currentTarget.value = "";
      return;
    }
    // preview
    const reader = new FileReader();
    reader.onload = () => {
      setPreviewSrc(String(reader.result));
      setUploadedFile(file);
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const handlePayment = async () => {
    setError(null);

    if (!uploadedFile) {
      setError("Please upload payment confirmation image before proceeding.");
      return;
    }

    if (!savedPolicyData?.policyNumber) {
      setError("Policy not saved. Please complete previous steps.");
      return;
    }

    setLoading(true);
    try {
      const invoiceNumber = savedPolicyData.invoiceNumber || `INV-${Date.now()}`;

      const fd = new FormData();
      fd.append("paymentProof", uploadedFile);
      fd.append("policyNumber", savedPolicyData.policyNumber);
      fd.append("invoiceNumber", invoiceNumber);
      fd.append("amount", String(insuranceCost));

      // Send multipart/form-data to server
      const res = await fetch("/api/process-payment", {
        method: "POST",
        body: fd,
      });

      // parse response safely
      const text = await res.text();
      let result: any = null;
      try {
        result = text ? JSON.parse(text) : null;
      } catch {
        result = { message: text };
      }

      if (!res.ok) {
        console.error("Payment API error:", res.status, result);
        throw new Error(result?.error || `Payment failed (status ${res.status})`);
      }

      // success
      setPaid(true);
      toast.success("Payment successful! Your insurance is now active.");
      // move to confirmation step after a short delay so user sees the sticky confirmation
      setTimeout(() => {
        setStep(7);
      }, 700);
    } catch (err: any) {
      console.error("Payment error:", err);
      setError(err?.message || "Payment failed. Please try again.");
      toast.error(err?.message || "Payment failed.");
    } finally {
      setLoading(false);
    }
  };

  const stepVariants = {
    enter: (direction: number) => ({ x: direction > 0 ? 300 : -300, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (direction: number) => ({ x: direction < 0 ? 300 : -300, opacity: 0 }),
  };

  const transition: Transition = { type: "tween", ease: "anticipate", duration: 0.5 };

  return (
    <main className="min-h-screen flex flex-col bg-[#f8fdf9] font-['Instrument_Sans']">
      {/* ===== Top Header ===== */}
      <div className="bg-white shadow-sm flex justify-between items-center px-4 py-3">
        <div className="flex items-center gap-2">
          <Image src="/images/logo.svg" alt="Company Logo" width={32} height={32} />
          <span className="text-sm font-semibold text-[#004243]">Mandinex Insurance</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <Phone size={16} className="text-[#146551]" />
          <span>9606995351</span>
        </div>
      </div>

      {/* ===== Loader ===== */}
      {step === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center bg-[#f8fdf9]">
          <motion.div
            className="flex items-center gap-3"
            initial={{ x: "100%" }}
            animate={{ x: "-100%" }}
            transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
          >
            <img src="/images/indian_truck_latest.png" alt="Indian Truck" className="w-40 sm:w-56 h-auto object-contain" />
          </motion.div>

          <motion.span
            className="mt-6 text-[#004243] font-semibold text-lg text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ repeat: Infinity, duration: 1.5, repeatType: "reverse" }}
          >
            Loading your insurance form...
          </motion.span>
        </div>
      )}

      {/* ===== Stepper Header ===== */}
      {step > 0 && (
        <header className="p-4 sticky top-0 z-20 bg-white shadow-sm">
          <h1 className="text-lg font-semibold text-[#004243] text-center">Insurance Invoice</h1>
          <p className="text-xs text-gray-500 text-center">Powered by Mandinex</p>
          <div className="flex justify-center items-center mt-3 gap-2">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={`step-${n}`} className="flex items-center">
                <motion.div
                  className={`w-7 h-7 flex items-center justify-center rounded-full text-sm font-semibold transition-all duration-300 ${n <= step ? "bg-[#146551] text-white" : "bg-gray-300 text-gray-600"}`}
                  animate={{ scale: n === step ? 1.1 : 1 }}
                >
                  {n <= step ? "✓" : n}
                </motion.div>
                {n < 6 && <div className={`w-6 h-1 rounded ${n < step ? "bg-[#146551]" : "bg-gray-300"}`} />}
              </div>
            ))}
          </div>
        </header>
      )}

      {/* ===== Steps (1-7) ===== */}
      <div className="flex-1 relative">
        {/* STEP 1 */}
        {step === 1 && (
          <motion.section custom={1} variants={stepVariants} initial="enter" animate="center" transition={transition} className="absolute inset-0 p-5 overflow-y-auto">
            <motion.div className="bg-white rounded-2xl shadow-md p-5 space-y-6" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2, duration: 0.4 }}>
              <div>
                <h2 className="text-xl font-bold text-[#004243]">Goods Carrying Vehicle Insurance</h2>
                <p className="text-sm text-gray-500">Fill in your vehicle details to continue</p>
              </div>

              <h3 className="text-base font-semibold text-[#004243]">Vehicle Details</h3>

              {/* Vehicle Number (Auto Hyphenated) */}
              <div>
                <label htmlFor="vehicleNumber" className="block text-sm font-medium text-gray-700 mb-1">Vehicle Number</label>
                <input
                  type="text"
                  id="vehicleNumber"
                  placeholder="DL-01-AB-1234"
                  value={formData.vehicleNumber}
                  onChange={(e) => {
                    let val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "");
                    if (val.length > 2) val = val.slice(0, 2) + "-" + val.slice(2);
                    if (val.length > 5) val = val.slice(0, 5) + "-" + val.slice(5);
                    if (val.length > 8) val = val.slice(0, 8) + "-" + val.slice(8);
                    setFormData((prev) => ({ ...prev, vehicleNumber: val }));
                  }}
                  maxLength={13}
                  className="w-full p-4 border border-gray-300 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:border-[#146551] focus:ring-1 focus:ring-[#146551]"
                />
              </div>

              {/* Driver License Number */}
              <div>
                <label htmlFor="driverLicense" className="block text-sm font-medium text-gray-700 mb-1">Driver License Number</label>
                <input
                  type="text"
                  id="driverLicense"
                  placeholder="Enter License Number"
                  value={formData.driverLicense}
                  onChange={(e) => setFormData((prev) => ({ ...prev, driverLicense: e.target.value }))}
                  className="w-full p-4 border border-gray-300 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:border-[#146551] focus:ring-1 focus:ring-[#146551]"
                />
              </div>

              {/* Upload Driver License */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Upload Driver License</label>
                <motion.label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-5 cursor-pointer text-gray-500 hover:border-[#146551] hover:bg-green-50 transition-all duration-200" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Upload size={22} />
                  <span className="text-sm">{files.licenseImage ? files.licenseImage.name : "Upload License File"}</span>
                  <input type="file" className="hidden" accept="image/*,.pdf" onChange={(e) => handleFileChange("licenseImage", e.target.files?.[0] || null)} />
                </motion.label>
              </div>

              {/* Vehicle Tonnage */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Tonnage</label>
                <div className="grid grid-cols-3 gap-3">
                  {["12", "15", "18", "20", "25", "30", "33"].map((ton) => (
                    <label key={ton} className={`flex items-center justify-center py-3 rounded-xl text-sm font-semibold cursor-pointer transition ${formData.vehicleTonnage === ton ? "bg-gradient-to-r from-[#2f5f49] to-[#146551] text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>
                      <input type="radio" name="vehicleTonnage" value={ton} checked={formData.vehicleTonnage === ton} onChange={(e) => setFormData((prev) => ({ ...prev, vehicleTonnage: e.target.value }))} className="hidden" />
                      {ton} Ton
                    </label>
                  ))}
                </div>
              </div>

              {/* Vehicle Permit (File Upload) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Permit</label>
                <motion.label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-5 cursor-pointer text-gray-500 hover:border-[#146551] hover:bg-green-50 transition-all duration-200" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Upload size={22} />
                  <span className="text-sm">{files.vehiclePermit ? files.vehiclePermit.name : "Upload Vehicle Permit"}</span>
                  <input type="file" className="hidden" accept="image/*,.pdf" onChange={(e) => handleFileChange("vehiclePermit", e.target.files?.[0] || null)} />
                </motion.label>
              </div>
            </motion.div>
          </motion.section>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <motion.section custom={1} variants={stepVariants} initial="enter" animate="center" exit="exit" transition={transition} className="absolute inset-0 p-5">
            <motion.div className="bg-white rounded-2xl shadow-md p-5 space-y-5" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2, duration: 0.4 }}>
              <h2 className="text-lg font-semibold text-[#004243] flex items-center gap-2"><MapPin size={20} /> Route & Cargo Info</h2>

              <InputWithIcon id="origin" label="Truck Loading Location" icon={MapPin} value={formData.origin} onChange={(val) => handleChange("origin", val)} />

              <InputWithIcon id="destination" label="Destination" icon={MapPin} value={formData.destination} onChange={(val) => handleChange("destination", val)} />

              <InputWithIcon id="supplierName" label="Supplier Name" icon={User} value={formData.supplierName} onChange={(val) => handleChange("supplierName", val)} />

              <InputWithIcon id="supplierFirm" label="Supplier Firm Name" icon={User} value={formData.supplierFirm || ""} onChange={(val) => handleChange("supplierFirm", val)} />

              <div>
                <label htmlFor="goodsType" className="block text-sm font-medium text-gray-700 mb-1">Goods Type</label>
                <div className="relative">
                  <select id="goodsType" value={formData.goodsType} onChange={(e) => handleChange("goodsType", e.target.value)} className="w-full p-4 border border-gray-300 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:border-[#146551] focus:ring-1 focus:ring-[#146551] appearance-none pr-10 transition-all duration-200">
                    <option value="">Select goods type</option>
                    <option value="TENDER COCONUT">TENDER COCONUT</option>
                    <option value="APPLES">APPLES</option>
                    <option value="MANGOES">MANGOES</option>
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">▼</div>
                </div>
              </div>

              <div className="relative">
                <select id="lastEmiPaid" value={formData.lastEmiPaid} onChange={(e) => handleChange("lastEmiPaid", e.target.value)} className="w-full p-4 pl-10 border border-gray-300 rounded-lg text-sm text-gray-800 focus:border-[#146551] focus:ring-1 focus:ring-[#146551] transition-all duration-200">
                  <option value="">Paid Last EMI?</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              </div>
            </motion.div>
          </motion.section>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <motion.section custom={1} variants={stepVariants} initial="enter" animate="center" exit="exit" transition={transition} className="absolute inset-0 p-5">
            <motion.div className="bg-white rounded-2xl shadow-md p-5 space-y-6" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2, duration: 0.4 }}>
              <h2 className="text-lg font-semibold text-[#004243] flex items-center gap-2"><FileText size={20} /> Invoice & Documents</h2>

              <div>
                <label htmlFor="amountValue" className="block text-sm font-medium text-gray-700 mb-1">Invoice Amount (₹)</label>
                <input type="number" id="amountValue" value={formData.amountValue} onChange={(e) => handleChange("amountValue", e.target.value)} placeholder="Enter invoice amount" className="w-full p-4 border border-gray-300 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:border-[#146551] focus:ring-1 focus:ring-[#146551] transition-all duration-200" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Upload Weightment Slip</label>
                <motion.label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-5 cursor-pointer text-gray-500 hover:border-[#146551] hover:bg-green-50 transition-all duration-200" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Upload size={22} />
                  <span className="text-sm">{files.weightmentSlip ? files.weightmentSlip.name : "Choose file to upload"}</span>
                  <input type="file" className="hidden" accept=".pdf,image/*" onChange={(e) => handleFileChange("weightmentSlip", e.target.files?.[0] || null)} />
                </motion.label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Upload RC Document</label>
                <motion.label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-5 cursor-pointer text-gray-500 hover:border-[#146551] hover:bg-green-50 transition-all duration-200" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Upload size={22} />
                  <span className="text-sm">{files.rcDocument ? files.rcDocument.name : "Choose file to upload"}</span>
                  <input type="file" className="hidden" accept=".pdf,image/*" onChange={(e) => handleFileChange("rcDocument", e.target.files?.[0] || null)} />
                </motion.label>
              </div>
            </motion.div>
          </motion.section>
        )}

        {/* STEP 4 - Insurance Preview */}
        {step === 4 && (
          <motion.section custom={1} variants={stepVariants} initial="enter" animate="center" exit="exit" transition={transition} className="absolute inset-0 p-5 overflow-y-auto">
            <motion.div className="bg-white rounded-2xl shadow-lg overflow-hidden" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2, duration: 0.4 }}>
              <motion.div className="bg-gradient-to-r from-[#146551] to-[#0f3b2d] p-5 flex justify-between items-center text-white" initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3, duration: 0.4 }}>
                <div>
                  <h3 className="text-2xl font-extrabold tracking-wide font-['Montserrat'] bg-white text-[#146551] px-4 py-1 rounded-md shadow-inner">
                    {formData.vehicleNumber || "RJ14XX0000"}
                  </h3>
                  <p className="text-sm opacity-90 mt-1">Truck Insurance Preview</p>
                </div>
                <motion.div className="text-4xl" animate={{ rotate: [0, 10, -10, 0] }} transition={{ delay: 0.5, duration: 0.6 }}>🚛</motion.div>
              </motion.div>

              <motion.div className="p-5 space-y-4 text-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4, duration: 0.4 }}>
                {[
                  ["Driver License", formData.driverLicense, <User size={16} className="text-[#146551]" />],
                  ["Vehicle Tonnage", formData.vehicleTonnage, <Truck size={16} className="text-[#146551]" />],
                  ["Vehicle Permit", formData.vehiclePermit, <FileText size={16} className="text-[#146551]" />],
                  ["Origin", formData.origin, <MapPin size={16} className="text-[#146551]" />],
                  ["Destination", formData.destination, <MapPin size={16} className="text-[#146551]" />],
                  ["Supplier Name", formData.supplierName, <User size={16} className="text-[#146551]" />],
                  ["Goods Type", formData.goodsType, <PackageIcon size={16} className="text-[#146551]" />],
                  ["Amount Value", `₹${formData.amountValue || "0"}`, <CreditCard size={16} className="text-[#146551]" />],
                  ["Last EMI Paid?", formData.lastEmiPaid || "No", <CreditCard size={16} className="text-[#146551]" />],
                ].map(([label, value, icon], index) => (
                  <motion.div key={String(label)} className="flex justify-between items-center border-b pb-2" initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.5 + index * 0.05, duration: 0.3 }}>
                    <span className="flex items-center gap-2 font-medium text-gray-700 font-['Poppins']">{icon} {label}</span>
                    <span className="text-gray-900 font-semibold">{value || "-"}</span>
                  </motion.div>
                ))}
              </motion.div>

              <motion.div className="bg-green-50 relative p-6 text-center border-t border-gray-200" initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6, duration: 0.4 }}>
                <div className="absolute right-5 bottom-3 text-6xl opacity-10 pointer-events-none">🚛</div>
                <h4 className="text-sm font-semibold text-[#004243] mb-2 font-['Montserrat']">Insurance Premium (₹200 per lakh)</h4>
                <motion.p className="text-3xl font-bold text-[#146551] font-['Poppins']" animate={{ scale: [1, 1.05, 1] }} transition={{ delay: 0.8, duration: 0.5 }}>
                  ₹{formData.amountValue ? ((parseFloat(formData.amountValue) / 100000) * 200).toFixed(0) : "0"}
                </motion.p>
              </motion.div>
            </motion.div>
          </motion.section>
        )}

        {/* STEP 5 - Invoice preview & download */}
        {step === 5 && (
          <motion.section custom={1} variants={stepVariants} initial="enter" animate="center" exit="exit" transition={transition} className="relative h-full flex flex-col p-5">
            <motion.div className="bg-white rounded-2xl shadow-md p-5 space-y-4 flex-1 overflow-y-auto" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2, duration: 0.4 }}>
              <h2 className="text-lg font-semibold text-[#004243]">Invoice Preview</h2>
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3, duration: 0.4 }}>
                {pdfUrl ? (
                  <iframe src={pdfUrl} className="w-full h-[600px] border rounded-xl shadow-md" title="Invoice Preview" />
                ) : (
                  <div className="w-full h-[600px] border rounded-xl shadow-md bg-gray-100 flex items-center justify-center">
                    <p className="text-gray-500">Generating invoice...</p>
                  </div>
                )}
              </motion.div>

              <motion.a href={pdfUrl || "#"} download={`invoice-${Date.now()}.pdf`} className="block w-full text-center bg-gradient-to-r from-[#2f5f49] to-[#146551] text-white py-3 rounded-lg font-semibold hover:opacity-90 transition-all duration-200" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5, duration: 0.3 }}>
                Download Invoice
              </motion.a>
            </motion.div>
          </motion.section>
        )}

        {/* STEP 6 - Payment */}
{/* STEP 6 - Payment */}
{/* STEP 6 - Payment */}
{step === 6 && (
  <motion.section
    custom={1}
    variants={stepVariants}
    initial="enter"
    animate="center"
    exit="exit"
    transition={transition}
    className="absolute inset-0 p-5"
  >
    <motion.div
      className="bg-white rounded-2xl shadow-md p-5 space-y-5"
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.2, duration: 0.4 }}
    >
      <h2 className="text-lg font-semibold text-[#004243] flex items-center gap-2">
        <CreditCard size={20} /> Payment Gateway
      </h2>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.4 }}
      >
        <p className="text-gray-600 text-sm mb-4">
          Complete the payment to confirm your insurance policy.
        </p>

        <div className="bg-green-50 p-4 rounded-lg mb-4">
          <div className="flex justify-between items-center">
            <span className="font-medium text-[#004243]">Total Premium:</span>
            <span className="text-xl font-bold text-[#146551]">₹{insuranceCost.toFixed(0)}</span>
          </div>
        </div>

        <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          {/* QR Image - BIGGER */}
          <div className="flex justify-center md:justify-start">
            <div className="rounded-lg overflow-hidden border border-gray-100 bg-white flex items-center justify-center p-3">
              <img
                src="/images/qr-placeholder.jpeg"
                alt="Payment QR"
                className="w-52 h-52 md:w-72 md:h-72 object-contain block"
              />
            </div>
          </div>

          {/* Upload payment confirmation */}
          <div>
            <label className="text-sm text-gray-600 mb-2 block">Upload payment confirmation</label>
            <div className="flex gap-3 items-start">
              {/* Show upload button ONLY if no image is uploaded */}
              {!previewSrc && (
                <label
                  htmlFor="payment-image"
                  className="flex items-center gap-2 border border-dashed border-gray-200 rounded-lg px-4 py-3 cursor-pointer hover:bg-gray-50"
                >
                  <Upload size={16} />
                  <span className="text-sm text-gray-700">Upload image</span>
                  <input
                    id="payment-image"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleUploadChange}
                  />
                </label>
              )}

              <div className="flex-1">
                <p className="text-xs text-gray-500 mb-2">
                  Please upload the payment receipt or screenshot. Accepted: images (JPG/PNG). Max 5MB.
                </p>

                {previewSrc ? (
                  <div className="flex items-start gap-3">
                    <img src={previewSrc} alt="preview" className="w-28 h-28 object-cover rounded-md border" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800">{uploadedFile?.name}</p>
                      <p className="text-xs text-gray-500">{Math.round((uploadedFile?.size ?? 0) / 1024)} KB</p>
                      <div className="mt-3 flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setPreviewSrc(null);
                            setUploadedFile(null);
                            setPaid(false);
                          }}
                          className="text-sm px-3 py-1 rounded-md border border-gray-200 bg-white"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-md border border-gray-100 px-3 py-4 text-sm text-gray-500">
                    No payment proof uploaded yet.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Pay button */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.3 }}
      >
        <button
          onClick={handlePayment}
          disabled={!uploadedFile || loading || paid}
          className="w-full py-3 rounded-lg bg-gradient-to-r from-[#2f5f49] to-[#146551] text-white font-semibold hover:opacity-90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Processing..." : paid ? `Paid ₹${insuranceCost.toFixed(0)}` : `Pay ₹${insuranceCost.toFixed(0)}`}
        </button>
      </motion.div>

      {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
    </motion.div>

    {/* Sticky confirmation bar at bottom of the step once paid */}
    {paid && (
      <div className="absolute left-0 right-0 bottom-4 flex justify-center pointer-events-none">
        <div className="pointer-events-auto bg-white/95 backdrop-blur-sm rounded-full px-5 py-2 shadow-md border border-green-100 flex items-center gap-3">
          <Check size={18} className="text-green-600" />
          <div className="text-sm">
            <div className="text-xs text-gray-500">Payment confirmed</div>
            <div className="font-medium text-[#146551]">Paid ₹{insuranceCost.toFixed(0)}</div>
          </div>
        </div>
      </div>
    )}
  </motion.section>
)}

        {/* STEP 7 - Success/Confirmation */}
        {step === 7 && (
          <motion.section custom={1} variants={stepVariants} initial="enter" animate="center" exit="exit" transition={transition} className="absolute inset-0 p-5">
            <motion.div className="bg-white rounded-2xl shadow-md p-5 space-y-5 text-center" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2, duration: 0.5, type: "spring" }}>
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3, duration: 0.5, type: "spring" }} className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                <Check size={40} className="text-green-600" />
              </motion.div>

              <h2 className="text-xl font-semibold text-[#004243]">Payment Successful!</h2>
              <p className="text-gray-600">Your insurance policy has been activated successfully.</p>

              <div className="bg-gray-50 p-4 rounded-lg text-left space-y-2">
                <div className="flex justify-between"><span className="text-gray-600">Policy Number:</span><span className="font-medium">{savedPolicyData?.policyNumber || "N/A"}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Premium Paid:</span><span className="font-medium">₹{insuranceCost.toFixed(0)}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Status:</span><span className="font-medium text-green-600">Active</span></div>
              </div>

              <div className="space-y-3">
                <motion.button onClick={() => {
                  setStep(0);
                  setFormData({
                    vehicleNumber: "",
                    driverLicense: "",
                    vehicleTonnage: "",
                    vehiclePermit: "",
                    origin: "",
                    destination: "",
                    supplierName: "",
                    supplierFirm: "",
                    goodsType: "",
                    amountValue: "",
                    lastEmiPaid: "",
                  });
                  setSavedPolicyData(null);
                  setPdfUrl(null);
                  setUploadedFile(null);
                  setPreviewSrc(null);
                  setPaid(false);
                }} className="w-full py-3 rounded-lg bg-gradient-to-r from-[#2f5f49] to-[#146551] text-white font-semibold hover:opacity-90 transition-all duration-200" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  Create New Policy
                </motion.button>

                {pdfUrl && (
                  <motion.a href={pdfUrl} download={`invoice-${savedPolicyData?.policyNumber || Date.now()}.pdf`} className="block w-full py-3 rounded-lg bg-gray-100 text-[#004243] font-semibold hover:bg-gray-200 transition-all duration-200 text-center" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    Download Invoice
                  </motion.a>
                )}
              </div>
            </motion.div>
          </motion.section>
        )}
      </div>

      {/* ===== Bottom Navigation ===== */}
      {step > 0 && step < 7 && (
        <footer className="mt-4 sticky bottom-0 left-0 w-full bg-white border-t shadow-inner flex justify-between items-center px-4 py-3 rounded-t-xl">
          <button onClick={prevStep} className="px-5 py-2 rounded-lg bg-gray-100 text-gray-700 text-sm">Previous</button>
          <button onClick={handleNext} disabled={loading} className="px-6 py-2 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-[#2f5f49] to-[#146551] hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? "Saving..." : "Next"}
          </button>
        </footer>
      )}
    </main>
  );
}