import { motion } from "framer-motion";
import { useForm } from "react-hook-form";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";

const waitlistSchema = z.object({
  fullName: z.string().min(3, "Full name must be at least 3 characters"),
  phone: z.string().min(11, "Enter a valid phone number"),
  email: z.string().email("Enter a valid email address"),
  location: z.string().min(1),
  role: z.string().min(1, "Select role"),
  state: z.string().min(2, "State required"),

  meterType: z.string().min(1),
  buyToken: z.string().min(1),
  tokenMethod: z.string().min(1),

  rechargeFrequency: z.string().min(1),

  biggestProblem: z.string().min(5),

  favoriteFeature: z.array(z.string()),
});

type WaitlistFormData = z.infer<typeof waitlistSchema>;

const Waitlist = () => {
  const navigate = useNavigate();

  const { register, handleSubmit, reset } = useForm<WaitlistFormData>({
    resolver: zodResolver(waitlistSchema),
  });

  const onSubmit = async (data: WaitlistFormData) => {
    try {
      await fetch("https://sheetdb.io/api/v1/7brsl48yeffag", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data: [
            {
              fullName: data.fullName,
              phone: data.phone,
              email: data.email,
              location: data.location,
              role: data.role,

              meterType: data.meterType,
              buyToken: data.buyToken,
              tokenMethod: data.tokenMethod,
              rechargeFrequency: data.rechargeFrequency,
              biggestProblem: data.biggestProblem,
              favoriteFeature: data.favoriteFeature.join(", "),
              createdAt: new Date().toISOString(),
            },
          ],
        }),
      });

      const response = await fetch("https://sheetdb.io/api/v1/w6vy16o2qexw0", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data: [
            {
              ...data,
              favoriteFeature: data.favoriteFeature.join(", "),
              createdAt: new Date().toISOString(),
            },
          ],
        }),
      });

      const result = await response.json();
      console.log("SheetDB response:", result);
      navigate("/Respond");

      reset();
    } catch (error) {
      alert("Something went wrong");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl bg-white shadow-xl rounded-2xl p-8"
      >
        <h1 className="text-xl font-bold text-orange-600 mb-2">Deyra</h1>

        <h2 className="text-2xl font-semibold mb-6">
          Join the Deyra Waitlist
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* BASIC INFO */}

          <input
            {...register("fullName")}
            placeholder="Full Name*"
            className="w-full border p-2 rounded-xl"
          />

          <input
            {...register("phone")}
            placeholder="Phone Number*"
            className="w-full border p-2 rounded-xl"
          />

          <input
            {...register("email")}
            placeholder="Email*"
            className="w-full border p-2 rounded-xl"
          />
          {/* ROLE */}
          <select
            {...register("role")}
            className="w-full border p-2 rounded-xl"
          >
            <option value="">Select Role</option>
            <option>Tenant</option>
            <option>Landlord</option>
            <option>Business Owner</option>
            <option>Estate Manager</option>
          </select>
          <input
            {...register("state")}
            placeholder="State*"
            className="w-full border p-2 rounded-xl"
          />

          <input
            {...register("location")}
            placeholder="Location(Ikeja,Ibandan,F.C.T)"
            className="w-full border p-2 rounded-xl"
          />

          <select
            {...register("meterType")}
            className="w-full border p-2 rounded-xl"
          >
            <option value="">Meter Type*</option>
            <option>Prepaid meter</option>
            <option>Postpaid meter</option>
            <option>Shared meter</option>
            <option>No meter</option>
          </select>

          <select
            {...register("buyToken")}
            className="w-full border p-2 rounded-xl"
          >
            <option value="">Do you buy electricity tokens?*</option>
            <option>Yes</option>
            <option>No</option>
          </select>

          {/* TOKEN PURCHASE */}

          <select
            {...register("tokenMethod")}
            className="w-full border p-2 rounded-xl"
          >
            <option value="">How do you buy tokens?*</option>
            <option>Bank app</option>
            <option>USSD</option>
            <option>POS/vendor</option>
            <option>Electricity office</option>
            <option>Other</option>
          </select>

          <select
            {...register("rechargeFrequency")}
            className="w-full border p-2 rounded-xl"
          >
            <option value="">How often do you recharge?</option>
            <option>Daily</option>
            <option>Weekly</option>
            <option>Monthly</option>
          </select>

          {/* BIGGEST PROBLEM */}
          <textarea
            {...register("biggestProblem")}
            placeholder="What is the biggest electricity problem you face?"
            className="w-full border p-3 rounded-xl"
          />

          {/* FEATURE PRIORITY */}
          <h3 className="font-semibold text-lg">
            Which Deyra feature excites you most?
          </h3>

          {[
            "Wallet funding",
            "Instant token recharge",
            "Electricity usage insights",
            "Debt tracking",
            "AI energy assistant",
            "Energy saving tips",
            "Multiple meter management",
            "24/7 customer support",
          ].map((feature) => (
            <label key={feature} className="flex gap-2">
              <input
                type="checkbox"
                value={feature}
                {...register("favoriteFeature")}
              />
              {feature}
            </label>
          ))}

          {/* SUBMIT */}
          <button
            type="submit"
            className="w-full bg-orange-600 text-white py-3 rounded-xl cursor-pointer"
          >
            Join Waitlist
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default Waitlist;
