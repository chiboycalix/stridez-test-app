'use client';
import SocialButtons from '@/components/SocialButtons';
import Input from '@/components/ui/Input';
import Spinner from '@/components/Spinner';
import Cookies from "js-cookie";
import Toastify from '@/components/Toastify';
import { useState } from 'react';
import { LockIcon, Mail } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { useAuth } from '@/context/AuthContext';
import { baseUrl } from "@/utils/constant";

export default function SignInForm() {
  const router = useRouter();
  const { setAuth } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState("");


  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    setLoading(true);
    e.preventDefault();

    try {
      const response = await fetch(`${baseUrl}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        console.log(data.data);
        setAuth(true, data.data);
        Cookies.set("accessToken", data.data.token, { expires: 1 / 24 });

        console.log(
          "profileSetupCompleted",
          data.data.profileSetupCompleted,
          typeof data.data.profileSetupCompleted
        );

        setAlert("Login Successful");
        if (!data.data.profileSetupCompleted) {
          router.push("/setup-profile");
          return;
        }
        router.push("/");
      } else {
        setAlert(
          String(data.message) || "Invalid email or password. Please try again."
        );
        setLoading(false);
      }
    } catch (error) {
      console.error("Error:", error);
      setAlert("An error occurred while signing in. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const OrSeparator = () => (
    <div className="flex items-center gap-x-4 w-full mx-auto px-1.5 text-sm text-gray-400">
      <div className="h-[0.1rem] w-full bg-gray-300" />
      <div>OR</div>
      <div className="h-[0.1rem] w-full bg-gray-300" />
    </div>
  )

  return (
    <div className="space-y-6">
      <Toastify message={alert} />
      <div className="">
        <SocialButtons />
        <OrSeparator />
      </div>

      <form
        className="mx-auto mb-0 mt-1 w-full space-y-3"
        onSubmit={handleSubmit}
      >
        <Input
          icon={<Mail className="h-5 w-5 text-gray-400" />}
          label="Email"
          variant="text"
          id="email"
          name="email"
          placeholder="johndoe@strides.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full"
        />
        <Input
          icon={<LockIcon className="h-5 w-5 text-gray-400" />}
          label="Password"
          variant="password"
          id="password"
          name="password"
          placeholder="*****"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <div className="flex items-center justify-between">
          <div
            className="text-sm flex items-center gap-2"
          >
            <Checkbox />
            <span>Remember Password</span>
          </div>
          <div
            onClick={() => router.push("/auth/forgot-password")}
            className="text-primary text-sm hover:cursor-pointer font-semibold"
          >
            Forgot password?
          </div>
        </div>
        <Button
          type="submit"
          disabled={loading}
          className="w-full"
        >
          {loading ? <Spinner /> : "Sign In with Stridez"}
        </Button>
      </form>
    </div>
  );
}
