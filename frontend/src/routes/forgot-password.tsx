import {
  createFileRoute,
  Link,
} from "@tanstack/react-router";

import { useState } from "react";
import { ArrowLeft, Mail } from "lucide-react";

import api from "@/api/axios";


export const Route = createFileRoute("/forgot-password")({
  component: ForgotPasswordPage,

  head: () => ({
    meta: [
      {
        title: "Forgot Password · Pathwise",
      },
    ],
  }),
});


function ForgotPasswordPage() {

  const [email,setEmail] = useState("");

  const [message,setMessage] = useState("");

  const [loading,setLoading] = useState(false);



  async function handleSubmit(
    e: React.FormEvent
  ){

    e.preventDefault();


    try {

      setLoading(true);


      const response = await api.post(
        "forgot-password/",
        {
          email,
        }
      );


      setMessage(
        response.data.message
      );


    } catch(error){

      setMessage(
        "Something went wrong."
      );


    } finally {

      setLoading(false);

    }

  }



  return (

    <div className="min-h-screen bg-[#021c14] flex items-center justify-center px-6">


      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl">


        <Link
          to="/login"
          className="flex items-center gap-2 text-sm text-neutral-500 hover:text-emerald-700"
        >

          <ArrowLeft className="h-4 w-4"/>

          Back to login

        </Link>



        <div className="mt-8">


          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">

            <Mail className="text-emerald-700"/>

          </div>



          <h1 className="mt-5 text-3xl font-semibold text-emerald-950">

            Forgot password?

          </h1>


          <p className="mt-2 text-sm text-neutral-500">

            Enter your email and we will send you a password reset link.

          </p>


        </div>




        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-5"
        >


          <div>


            <label className="text-sm font-medium text-neutral-700">

              Email

            </label>


            <input

              type="email"

              required

              value={email}

              onChange={(e)=>setEmail(e.target.value)}

              placeholder="you@example.com"

              className="mt-2 w-full rounded-xl border border-neutral-200 px-4 py-3 outline-none focus:border-emerald-600"

            />

          </div>




          <button

            disabled={loading}

            className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-900 py-3 text-white transition hover:bg-emerald-800"

          >

            {loading
              ? "Sending..."
              : "Send reset link"
            }


          </button>


        </form>



        {
          message && (

            <div className="mt-5 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800">

              {message}

            </div>

          )
        }



      </div>


    </div>

  );

}