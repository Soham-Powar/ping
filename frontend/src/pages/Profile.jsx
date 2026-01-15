import { useEffect, useState } from "react";
import { apiFetch } from "../api/client";

import ChatError from "./ChatError";

export default function Profile() {
	const [user, setUser] = useState(null);
	const [bio, setBio] = useState("");
	const [avatar, setAvatar] = useState(null);

	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [saving, setSaving] = useState(false);

	useEffect(() => {
		const fetchProfile = async () => {
			try {
				const res = await apiFetch("/users/me");
				setUser(res.user);
				setBio(res.user.bio);
			} catch (err) {
				setError(err);
			} finally {
				setLoading(false);
			}
		}
		fetchProfile();
	}, [])


	const handleSubmit = async (e) => {
		e.preventDefault();
		setSaving(true);

		try {
			const formData = new FormData();
			formData.append("bio", bio);
			if (avatar) formData.append('avatar', avatar);

			const res = await apiFetch("/users/me", {
				method: "PATCH",
				body: formData,
			});

			setUser(res.user);
			setAvatar(null);
		} catch (err) {
			setError(err);
		} finally {
			setSaving(false);
		}
	}

	if (loading) return <p>Loading...</p>;
	if (error) {
		return (
			<ChatError />
		);
	}

	return (
		<div className="h-screen flex flex-col bg-gray-900 text-white">
			<div className="h-16 px-4 border-b border-slate-700 flex items-center">
				<h1 className="text-lg font-semibold">Edit Profile</h1>
			</div>

			<div className="flex-1 overflow-y-auto p-6 flex justify-center">
				<form
					onSubmit={handleSubmit}
					className="
    w-full max-w-xl
    bg-slate-800 border border-white/10
    rounded-xl p-6
    space-y-6
  "
				>
					{/* Avatar */}
					<div className="flex items-center gap-6">
						<img
							src={user.avatar_url || "/default-avatar.png"}
							alt="avatar"
							className="w-24 h-24 rounded-full object-cover border border-white/10"
						/>

						<div>
							<label className="cursor-pointer inline-block text-sm text-slate-400 hover:text-white">
								<input
									type="file"
									accept="image/*"
									onChange={(e) => setAvatar(e.target.files[0])}
									className="hidden"
								/>
								Change avatar
							</label>
							<p className="mt-1 text-xs text-slate-500">
								JPG, PNG up to ~2MB
							</p>
						</div>
					</div>

					{/* Username */}
					<div className="pt-5">
						<label className="block text-xs text-slate-400 mb-1">
							Username
						</label>
						<input
							value={user.username}
							disabled
							className="
        w-full rounded-lg
        bg-slate-900 border border-white/10
        p-3 text-slate-400
        cursor-not-allowed
      "
						/>
					</div>

					{/* Email */}
					<div className="pt-5">
						<label className="block text-xs text-slate-400 mb-1">
							Email
						</label>
						<input
							value={user.email}
							disabled
							className="
        w-full rounded-lg
        bg-slate-900 border border-white/10
        p-3 text-slate-400
        cursor-not-allowed
      "
						/>
					</div>

					{/* Bio */}
					<div className="pt-5">
						<label className="block text-xs text-slate-400 mb-1">
							Bio
						</label>
						<textarea
							value={bio}
							onChange={(e) => setBio(e.target.value)}
							maxLength={160}
							placeholder="Tell something about yourself..."
							className="
        w-full min-h-[110px]
        rounded-lg
        bg-slate-900 border border-white/10
        p-3 text-white
        resize-none
        focus:outline-none focus:border-indigo-500
      "
						/>
						<div className="mt-1 text-right text-[11px] text-slate-400">
							{bio.length}/160
						</div>
					</div>

					{/* Save button */}
					<div className="flex justify-end">
						<button
							type="submit"
							disabled={saving}
							className="
        px-5 py-2
        rounded-lg
        bg-indigo-600 hover:bg-indigo-700
        disabled:opacity-50 disabled:cursor-not-allowed
        transition-colors
      "
						>
							{saving ? "Saving..." : "Save Changes"}
						</button>
					</div>
				</form>

			</div>
		</div>
	);

}