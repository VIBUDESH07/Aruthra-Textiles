import { useState } from "react";
import { toast } from "react-toastify";

export default function AddUser() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("user");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, role }),
      });
      if (!res.ok) throw new Error("Failed to add user");
      toast.success("User added successfully");
      setUsername("");
      setEmail("");
      setRole("user");
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="container mx-auto p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-center mb-6">Add User</h1>
      <form onSubmit={handleSubmit} className="max-w-md mx-auto bg-white p-6 shadow-md rounded-lg">
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          className="border p-3 w-full mb-4"
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="border p-3 w-full mb-4"
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="border p-3 w-full mb-4"
        >
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
        <button type="submit" className="bg-blue-500 text-white p-3 rounded-lg w-full">Add User</button>
      </form>
    </div>
  );
}