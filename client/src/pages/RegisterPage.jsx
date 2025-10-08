import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, AtSign, Loader2 } from "lucide-react";
import useAuthStore from "@/store/authStore";
import { toast } from "react-hot-toast";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register, isLoading, error } = useAuthStore();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullname: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("Password tidak cocok!");
      return;
    }

    if (!formData.agreeToTerms) {
      toast.error("Harap setujui syarat dan ketentuan!");
      return;
    }

    // Prepare data for API (exclude confirmPassword and agreeToTerms)
    const { confirmPassword, agreeToTerms, ...registrationData } = formData;

    const result = await register(registrationData);

    if (result.success) {
      // Redirect to dashboard
      navigate("/dashboard");
    }
    // Error handling is done in the store with toast
  };

  return (
    <div className="min-h-screen bg-[#0F1624]  flex items-center justify-center p-4">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-20 h-20 bg-blue-500/20 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-purple-500/20 rounded-full blur-lg animate-pulse delay-1000"></div>
        <div className="absolute bottom-40 left-1/4 w-12 h-12 bg-green-500/20 rounded-full blur-lg animate-pulse delay-2000"></div>
        <div className="absolute top-1/3 right-1/3 w-8 h-8 bg-yellow-500/20 rounded-full blur-md animate-pulse delay-3000"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-4 mt-5">
          <Link to="/" className="inline-block">
            <img src="/public/icons/ajarin-icon.svg" alt="" className="w-50" />{" "}
          </Link>
        </div>

        <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-white">Daftar Akun Baru</CardTitle>
            <CardDescription className="text-slate-400">Isi data diri untuk membuat akun Ajarin.id</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Full Name Input */}
              <div className="space-y-2">
                <label htmlFor="fullname" className="text-sm font-medium text-slate-300">
                  Nama Lengkap
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                  <input
                    id="fullname"
                    name="fullname"
                    type="text"
                    placeholder="Masukkan nama lengkap"
                    value={formData.fullname}
                    onChange={handleInputChange}
                    className="flex h-10 w-full rounded-md border border-slate-600 bg-slate-700/50 px-3 py-2 pl-10 text-sm text-white placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    required
                  />
                </div>
              </div>

              {/* Username Input */}
              <div className="space-y-2">
                <label htmlFor="username" className="text-sm font-medium text-slate-300">
                  Username
                </label>
                <div className="relative">
                  <AtSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                  <input
                    id="username"
                    name="username"
                    type="text"
                    placeholder="Masukkan username unik"
                    value={formData.username}
                    onChange={handleInputChange}
                    className="flex h-10 w-full rounded-md border border-slate-600 bg-slate-700/50 px-3 py-2 pl-10 text-sm text-white placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    required
                    minLength={3}
                    maxLength={20}
                    pattern="^[a-zA-Z0-9_]+$"
                    title="Username hanya boleh mengandung huruf, angka, dan underscore"
                  />
                </div>
                <p className="text-xs text-slate-500">3-20 karakter, hanya huruf, angka, dan underscore</p>
              </div>

              {/* Email Input */}
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-slate-300">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="nama@email.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="flex h-10 w-full rounded-md border border-slate-600 bg-slate-700/50 px-3 py-2 pl-10 text-sm text-white placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-slate-300">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Minimal 8 karakter"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="flex h-10 w-full rounded-md border border-slate-600 bg-slate-700/50 px-3 py-2 pl-10 pr-10 text-sm text-white placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    required
                    minLength={8}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password Input */}
              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-medium text-slate-300">
                  Konfirmasi Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Ulangi password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="flex h-10 w-full rounded-md border border-slate-600 bg-slate-700/50 px-3 py-2 pl-10 pr-10 text-sm text-white placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    required
                  />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300">
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Terms and Conditions */}
              <div className="flex items-start space-x-3">
                <input
                  id="agreeToTerms"
                  name="agreeToTerms"
                  type="checkbox"
                  checked={formData.agreeToTerms}
                  onChange={handleInputChange}
                  className="mt-1 h-4 w-4 rounded border-slate-600 bg-slate-700 text-blue-600 focus:ring-2 focus:ring-blue-500/20"
                  required
                />
                <div className="text-sm text-slate-400 leading-5">
                  Saya setuju dengan{" "}
                  <Link to="/terms" className="text-blue-400 hover:text-blue-300 underline">
                    Syarat dan Ketentuan
                  </Link>{" "}
                  serta{" "}
                  <Link to="/privacy" className="text-blue-400 hover:text-blue-300 underline">
                    Kebijakan Privasi
                  </Link>{" "}
                  Ajarin.id
                </div>
              </div>

              {/* Submit Button */}
              <Button type="submit" disabled={isLoading} className="w-full  bg-[#2279AB] hover:bg-[#1f6d9a] text-white py-3 text-lg font-semibold transition-all duration-300 group disabled:opacity-50 disabled:cursor-not-allowed">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Mendaftar...
                  </>
                ) : (
                  <>
                    Daftar Sekarang
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </form>

            {/* Login Link */}
            <div className="text-center mt-6 pt-6 border-t border-slate-700">
              <p className="text-slate-400">
                Sudah punya akun?{" "}
                <Link to="/login" className="text-blue-400 hover:text-blue-300 font-semibold transition-colors">
                  Masuk sekarang
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <Link to="/" className="text-slate-400 hover:text-slate-300 transition-colors">
            ← Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}
