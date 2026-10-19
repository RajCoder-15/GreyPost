
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  UserRound,
  AtSign,
  FileText,
  Sparkles,
  LoaderCircle,
  CheckCircle2,
  AlertCircle,
  X,
  ShieldCheck,
} from "lucide-react";

function EditProfile() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      try {
        const response = await fetch(
          "http://localhost:3000/profile",
          { credentials: "include" }
        );

        if (response.status === 401 || response.status === 403) {
          navigate("/login");
          return;
        }

        if (!response.ok) {
          throw new Error("Could not load profile.");
        }

        const data = await response.json();
        const user = data.user;

        if (!user) {
          throw new Error("Profile data not found.");
        }

        if (active) {
          setName(user.name || "");
          setUsername(user.username || "");
          setBio(user.bio || "");
        }
      } catch (err) {
        if (active) {
          setError(err.message || "Something went wrong.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      active = false;
    };
  }, [navigate]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!name.trim() || !username.trim()) {
      setError("Name and username are required.");
      return;
    }

    if (bio.length > 160) {
      setError("Bio cannot exceed 160 characters.");
      return;
    }

    try {
      setSaving(true);

      const response = await fetch(
        "http://localhost:3000/profile",
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            username,
            bio,
          }),
        }
      );

      const data = await response.json().catch(() => ({}));

      if (response.status === 401 || response.status === 403) {
        navigate("/login");
        return;
      }

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to update profile."
        );
      }

      setSuccess("Profile updated successfully!");
      navigate("/profile");
    } catch (err) {
      setError(err.message || "Could not save profile.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#0b0b10] text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-500/10">
            <LoaderCircle
              size={30}
              className="animate-spin text-violet-400"
            />
          </div>
          <p className="text-sm text-zinc-400">
            Loading your profile...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-[#0b0b10] px-4 py-8 text-white sm:px-6 sm:py-12">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/2 h-96 w-[38rem] max-w-full -translate-x-1/2 rounded-full bg-violet-600/[0.12] blur-[120px]"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-40 -left-32 h-80 w-80 rounded-full bg-fuchsia-600/[0.06] blur-[100px]"
      />

      <div className="relative mx-auto w-full max-w-2xl">
        <button
          type="button"
          onClick={() => navigate("/profile")}
          className="mb-6 inline-flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-sm font-medium text-zinc-400 transition hover:border-violet-400/30 hover:bg-violet-500/[0.08] hover:text-white"
        >
          <ArrowLeft size={17} />
          Back to Profile
        </button>

        <section className="overflow-hidden rounded-3xl border border-white/[0.09] bg-[#121218] shadow-2xl shadow-black/20">
          <div className="relative overflow-hidden border-b border-white/[0.07] bg-gradient-to-br from-violet-950/70 via-[#201a31] to-[#121218] px-5 py-7 sm:px-8 sm:py-9">
            <div
              aria-hidden="true"
              className="absolute -right-10 -top-20 h-56 w-56 rounded-full border border-violet-300/[0.12] bg-violet-400/[0.04]"
            />

            <div
              aria-hidden="true"
              className="absolute -right-2 -top-12 h-40 w-40 rounded-full border border-violet-300/[0.10]"
            />

            <div className="relative flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-violet-300/20 bg-violet-400/10 text-violet-200 shadow-lg shadow-violet-950/20">
                <UserRound size={27} />
              </div>

              <div className="min-w-0">
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  Edit Profile
                </h1>

                <p className="mt-2 max-w-md text-sm leading-6 text-zinc-400">
                  Make your profile yours. Update your details and let the community get to know you.
                </p>
              </div>
            </div>
          </div>

          <div className="p-5 sm:p-8">
            {error && (
              <div
                role="alert"
                className="mb-6 flex items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/[0.07] p-4"
              >
                <AlertCircle
                  size={19}
                  className="mt-0.5 shrink-0 text-red-400"
                />
                <p className="min-w-0 flex-1 break-words text-sm leading-6 text-red-300">
                  {error}
                </p>
                <button
                  type="button"
                  onClick={() => setError("")}
                  aria-label="Dismiss error"
                  className="shrink-0 text-red-400 transition hover:text-red-200"
                >
                  <X size={17} />
                </button>
              </div>
            )}

            {success && (
              <div
                role="status"
                className="mb-6 flex items-center gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.07] p-4 text-sm text-emerald-300"
              >
                <CheckCircle2 size={19} className="shrink-0" />
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="name"
                  className="mb-2.5 flex items-center gap-2 text-sm font-medium text-zinc-200"
                >
                  <UserRound size={16} className="text-violet-300" />
                  Full Name
                </label>

                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={80}
                  required
                  placeholder="Enter your name"
                  autoComplete="name"
                  className="w-full rounded-xl border border-white/[0.09] bg-[#0b0b10] px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-zinc-600 hover:border-white/[0.15] focus:border-violet-400/60 focus:ring-4 focus:ring-violet-500/[0.08]"
                />

                <div className="mt-2 text-right text-xs text-zinc-600">
                  {name.length}/80
                </div>
              </div>

              <div>
                <label
                  htmlFor="username"
                  className="mb-2.5 flex items-center gap-2 text-sm font-medium text-zinc-200"
                >
                  <AtSign size={16} className="text-violet-300" />
                  Username
                </label>

                <div className="flex min-w-0 items-center overflow-hidden rounded-xl border border-white/[0.09] bg-[#0b0b10] transition hover:border-white/[0.15] focus-within:border-violet-400/60 focus-within:ring-4 focus-within:ring-violet-500/[0.08]">
                  <span className="pl-4 text-sm text-violet-300">
                    @
                  </span>

                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    maxLength={30}
                    required
                    placeholder="yourusername"
                    autoComplete="username"
                    className="w-full min-w-0 bg-transparent px-2 py-3.5 text-sm text-white outline-none placeholder:text-zinc-600"
                  />
                </div>

                <p className="mt-2 text-xs text-zinc-500">
                  This is how people will find you on GreyPost.
                </p>
              </div>

              <div>
                <div className="mb-2.5 flex items-center justify-between gap-3">
                  <label
                    htmlFor="bio"
                    className="flex items-center gap-2 text-sm font-medium text-zinc-200"
                  >
                    <FileText size={16} className="text-violet-300" />
                    About You
                  </label>

                  <span
                    className={`shrink-0 text-xs tabular-nums ${
                      bio.length >= 150
                        ? "text-violet-300"
                        : "text-zinc-500"
                    }`}
                  >
                    {bio.length}/160
                  </span>
                </div>

                <textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  maxLength={160}
                  rows={4}
                  placeholder="Share a little about yourself, your interests, or what you love..."
                  className="w-full resize-none rounded-xl border border-white/[0.09] bg-[#0b0b10] px-4 py-3.5 text-sm leading-6 text-white outline-none transition placeholder:text-zinc-600 hover:border-white/[0.15] focus:border-violet-400/60 focus:ring-4 focus:ring-violet-500/[0.08]"
                />

                <p className="mt-2 text-xs text-zinc-500">
                  Keep it short and make it yours.
                </p>
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-white/[0.07] pt-6 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => navigate("/profile")}
                  disabled={saving}
                  className="flex items-center justify-center gap-2 rounded-xl border border-white/10 px-5 py-3 text-sm font-semibold text-zinc-300 transition hover:border-white/20 hover:bg-white/[0.04] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ArrowLeft size={16} />
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center justify-center gap-2 rounded-xl bg-violet-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-950/30 transition hover:bg-violet-400 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? (
                    <LoaderCircle size={17} className="animate-spin" />
                  ) : (
                    <Save size={17} />
                  )}
                  {saving ? "Saving Changes..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </section>

        <p className="mt-6 text-center text-xs text-zinc-600">
          Your profile, your identity. <span className="text-violet-400">GreyPost.</span>
        </p>
      </div>
    </main>
  );
}

export default EditProfile;
