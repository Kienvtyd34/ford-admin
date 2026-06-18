import { useEffect, useState } from "react";
import {
  getIntents,
  createIntent,
  updateIntent,
  deleteIntent,
  toggleIntent
} from "../services/intentService";

export default function IntentAdmin() {
  const [intents, setIntents] = useState([]);
  const [form, setForm] = useState({
    name: "",
    label: "",
    keywords: "",
  });
  const [editId, setEditId] = useState(null);

  const loadData = async () => {
    const res = await getIntents();
    setIntents(res.data);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async () => {
    const payload = {
      ...form,
      keywords: form.keywords.split(",").map(k => k.trim()),
    };

    if (editId) {
      await updateIntent(editId, payload);
    } else {
      await createIntent(payload);
    }

    setForm({ name: "", label: "", keywords: "" });
    setEditId(null);
    loadData();
  };

  const handleEdit = (intent) => {
    setForm({
      name: intent.name,
      label: intent.label,
      keywords: intent.keywords.join(", "),
    });
    setEditId(intent._id);
  };

  const handleDelete = async (id) => {
    await deleteIntent(id);
    loadData();
  };

  const handleToggle = async (id) => {
    await toggleIntent(id);
    loadData();
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Intent Admin</h2>

      {/* FORM */}
      <div>
        <input
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <input
          placeholder="Label"
          value={form.label}
          onChange={(e) => setForm({ ...form, label: e.target.value })}
        />
        <input
          placeholder="Keywords (comma separated)"
          value={form.keywords}
          onChange={(e) => setForm({ ...form, keywords: e.target.value })}
        />

        <button onClick={handleSubmit}>
          {editId ? "Update" : "Create"}
        </button>
      </div>

      {/* LIST */}
      <table border="1" cellPadding="10">
        <thead>
          <tr>
            <th>Name</th>
            <th>Label</th>
            <th>Keywords</th>
            <th>Active</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {intents.map((i) => (
            <tr key={i._id}>
              <td>{i.name}</td>
              <td>{i.label}</td>
              <td>{i.keywords.join(", ")}</td>
              <td>{i.active ? "YES" : "NO"}</td>
              <td>
                <button onClick={() => handleEdit(i)}>Edit</button>
                <button onClick={() => handleDelete(i._id)}>Delete</button>
                <button onClick={() => handleToggle(i._id)}>
                  Toggle
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}