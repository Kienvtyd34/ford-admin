import { useEffect, useState } from "react";
import axios from "axios";

const API = "https://ford-admin.onrender.com/api/intents";

export default function IntentAdmin() {
  const [intents, setIntents] = useState([]);

  const [form, setForm] = useState({
    name: "",
    label: "",
    keywords: "",
    weight: 1,
    priorityBoost: 0,
    active: true,
  });

  const [editId, setEditId] = useState(null);

  const loadData = async () => {
    const res = await axios.get(API);
    setIntents(res.data.data);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async () => {
    const payload = {
      name: form.name,
      label: form.label,
      keywords: form.keywords
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean),
      weight: Number(form.weight),
      priorityBoost: Number(form.priorityBoost),
      active: form.active,
    };

    if (editId) {
      await axios.put(`${API}/${editId}`, payload);
    } else {
      await axios.post(API, payload);
    }

    setForm({
      name: "",
      label: "",
      keywords: "",
      weight: 1,
      priorityBoost: 0,
      active: true,
    });

    setEditId(null);
    loadData();
  };

  const handleEdit = (i) => {
    setForm({
      name: i.name,
      label: i.label,
      keywords: i.keywords.join(", "),
      weight: i.weight,
      priorityBoost: i.priorityBoost,
      active: i.active,
    });
    setEditId(i._id);
  };

  const handleDelete = async (id) => {
    await axios.delete(`${API}/${id}`);
    loadData();
  };

  const handleToggle = async (id) => {
    await axios.patch(`${API}/${id}/toggle`);
    loadData();
  };

  return (
    <div className="page">
      {/* HEADER */}
      <div className="header">
        🧠 Intent AI Admin Panel
      </div>

      {/* FORM */}
      <div className="card">
        <div className="grid">
          <input
            placeholder="Intent Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          <input
            placeholder="Label"
            value={form.label}
            onChange={(e) => setForm({ ...form, label: e.target.value })}
          />

          <input
            placeholder="Keywords (comma)"
            value={form.keywords}
            onChange={(e) =>
              setForm({ ...form, keywords: e.target.value })
            }
          />

          <input
            type="number"
            placeholder="Weight"
            value={form.weight}
            onChange={(e) =>
              setForm({ ...form, weight: e.target.value })
            }
          />

          <input
            type="number"
            placeholder="Boost"
            value={form.priorityBoost}
            onChange={(e) =>
              setForm({ ...form, priorityBoost: e.target.value })
            }
          />

          <label className="check">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) =>
                setForm({ ...form, active: e.target.checked })
              }
            />
            Active
          </label>
        </div>

        <button className="btn" onClick={handleSubmit}>
          {editId ? "Update Intent" : "Create Intent"}
        </button>
      </div>

      {/* TABLE */}
      <div className="tableCard">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Label</th>
              <th>Keywords</th>
              <th>Weight</th>
              <th>Boost</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {intents.map((i) => (
              <tr key={i._id}>
                <td className="name">{i.name}</td>
                <td>{i.label}</td>
                <td>
                  <div className="tags">
                    {i.keywords.map((k, idx) => (
                      <span key={idx} className="tag">
                        {k}
                      </span>
                    ))}
                  </div>
                </td>
                <td>{i.weight}</td>
                <td>{i.priorityBoost}</td>
                <td>
                  <span className={i.active ? "active" : "inactive"}>
                    {i.active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td>
                  <button onClick={() => handleEdit(i)}>Edit</button>
                  <button onClick={() => handleDelete(i._id)}>
                    Delete
                  </button>
                  <button onClick={() => handleToggle(i._id)}>
                    Toggle
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* STYLE */}
      <style>{`
        .page{
          background:#f3f4f6;
          min-height:100vh;
          padding:20px;
          font-family:Arial;
        }

        .header{
          font-size:22px;
          font-weight:700;
          margin-bottom:15px;
        }

        .card{
          background:white;
          padding:15px;
          border-radius:10px;
          box-shadow:0 2px 10px rgba(0,0,0,0.08);
          margin-bottom:20px;
        }

        .grid{
          display:grid;
          grid-template-columns: repeat(3, 1fr);
          gap:10px;
        }

        input{
          padding:10px;
          border:1px solid #ddd;
          border-radius:6px;
          outline:none;
        }

        .check{
          display:flex;
          align-items:center;
          gap:6px;
        }

        .btn{
          margin-top:10px;
          background:#1e3a8a;
          color:white;
          padding:10px 15px;
          border:none;
          border-radius:6px;
          cursor:pointer;
        }

        .tableCard{
          background:white;
          padding:10px;
          border-radius:10px;
          box-shadow:0 2px 10px rgba(0,0,0,0.08);
        }

        table{
          width:100%;
          border-collapse:collapse;
        }

        th{
          text-align:left;
          padding:10px;
          font-size:13px;
          background:#f9fafb;
        }

        td{
          padding:10px;
          border-top:1px solid #eee;
          font-size:13px;
          vertical-align:top;
        }

        .tags{
          display:flex;
          flex-wrap:wrap;
          gap:5px;
        }

        .tag{
          background:#e5e7eb;
          padding:3px 6px;
          border-radius:5px;
          font-size:12px;
        }

        .active{
          color:green;
          font-weight:600;
        }

        .inactive{
          color:red;
          font-weight:600;
        }

        button{
          margin-right:5px;
          padding:5px 8px;
          border:none;
          border-radius:5px;
          cursor:pointer;
          background:#e5e7eb;
        }

        button:hover{
          background:#d1d5db;
        }
      `}</style>
    </div>
  );
}