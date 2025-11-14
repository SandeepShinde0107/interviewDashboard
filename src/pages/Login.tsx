import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

type LoginFormValues = {
  username: string;
  password: string;
  role: "admin" | "ta_member" | "panelist";
};

export default function Login() {
  const { register, handleSubmit } = useForm<LoginFormValues>();
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const onSubmit = async (data: LoginFormValues) => {
    try {
     const res = await fetch("https://dummyjson.com/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  // Remove credentials if not needed
  body: JSON.stringify({
    username: data.username,
    password: data.password,
    // expiresInMins: 30  // optional
  }),
});

const loginResponse = await res.json();

if (!res.ok) {
  console.error("Login error:", loginResponse);
  alert(loginResponse.message || "Login failed");
  return;
}

      // const loginResponse = await res.json();

      // if (!res.ok) {
      //   alert(loginResponse.message || "Login failed");
      //   return;
      // }

      // Create our own sanitized user object
      const user = {
        id: loginResponse.id,
        username: loginResponse.username,
        role: data.role, // since DummyJSON does not provide roles
      };

      login(user); // store to sessionStorage
      navigate("/dashboard");
    } catch (error) {
      alert("Network error");
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-200">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-[360px]">
        {/* Logo or heading area */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-extrabold text-blue-600 mb-2">Welcome Back</h1>
          <p className="text-gray-500 text-sm">Please login to continue</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Username</label>
            <input
              {...register("username")}
              placeholder="Enter your username"
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Password</label>
            <input
              {...register("password")}
              type="password"
              placeholder="Enter your password"
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              required
            />
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Select Role</label>
            <select
              {...register("role")}
              className="w-full border border-gray-300 rounded-md p-2 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            >
              <option value="admin">Admin</option>
              <option value="ta_member">TA Member</option>
              <option value="panelist">Panelist</option>
            </select>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-md shadow-md transition-all focus:ring-4 focus:ring-blue-200"
          >
            Login
          </button>
        </form>

        {/* Optional footer */}
        <p className="text-center text-xs text-gray-500 mt-6">
          © {new Date().getFullYear()} Interview Management Dashboard
        </p>
      </div>
    </div>
  );
}
