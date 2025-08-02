"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import styles from "./AdminDashboard.module.css";

const AdminDashboard = () => {
  const router = useRouter();
  const [groups, setGroups] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [activeTab, setActiveTab] = useState("groups");

  const [editGroupId, setEditGroupId] = useState(null);
  const [editAssignmentId, setEditAssignmentId] = useState(null);

  const [newGroup, setNewGroup] = useState({ name: "", members: "" });
  const [newAssignment, setNewAssignment] = useState({
    title: "",
    description: "",
    deadline: "",
    groupId: "",
  });

  const [showGroupModal, setShowGroupModal] = useState(false);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profile, setProfile] = useState({ username: "", password: "", isEditing: false });

  useEffect(() => {
    const isAdmin = localStorage.getItem("role") === "admin";
    if (!isAdmin) {
      router.push("/dashboard");
    } else {
      fetchGroups();
      fetchAssignments();
    }
  }, []);

  const fetchGroups = async () => {
    const res = await axios.get("/api/groups");
    setGroups(res.data);
  };

  const fetchAssignments = async () => {
    const res = await axios.get("/api/assignments");

    const updatedAssignments = res.data.map((a) => {
      const count = Array.isArray(a.submissions) ? a.submissions.length : a.submissions || 0;
      const total = a.totalMembers || 0;
      const newStatus = count >= total && total > 0 ? "completed" : a.status;
      return { ...a, status: newStatus };
    });

    setAssignments(updatedAssignments);
  };

  const createOrUpdateGroup = async () => {
    const membersArray = newGroup.members.split(",").map((m) => m.trim());
    if (editGroupId) {
      await axios.put(`/api/groups/${editGroupId}`, {
        name: newGroup.name,
        members: membersArray,
      });
    } else {
      await axios.post("/api/groups", {
        name: newGroup.name,
        members: membersArray,
      });
    }

    setNewGroup({ name: "", members: "" });
    setEditGroupId(null);
    setShowGroupModal(false);
    fetchGroups();
  };

  const createOrUpdateAssignment = async () => {
    const selectedGroup = groups.find((g) => g._id === newAssignment.groupId);
    const payload = {
      ...newAssignment,
      submissions: 0,
      totalMembers: selectedGroup?.members.length || 0,
      status: "pending",
    };

    if (editAssignmentId) {
      await axios.put(`/api/assignments/${editAssignmentId}`, payload);
    } else {
      await axios.post("/api/assignments", payload);
    }

    setNewAssignment({
      title: "",
      description: "",
      deadline: "",
      groupId: "",
    });
    setEditAssignmentId(null);
    setShowAssignmentModal(false);
    fetchAssignments();
  };

  const handleEditGroup = (group) => {
    setNewGroup({ name: group.name, members: group.members.join(", ") });
    setEditGroupId(group._id);
    setShowGroupModal(true);
  };

  const handleDeleteGroup = async (id) => {
    await axios.delete(`/api/groups/${id}`);
    fetchGroups();
  };

  const handleEditAssignment = (assignment) => {
    setNewAssignment({
      title: assignment.title,
      description: assignment.description,
      deadline: assignment.deadline?.split("T")[0],
      groupId: assignment.groupId,
    });
    setEditAssignmentId(assignment._id);
    setShowAssignmentModal(true);
  };

  const handleDeleteAssignment = async (id) => {
    await axios.delete(`/api/assignments/${id}`);
    fetchAssignments();
  };

  const openProfile = async () => {
    const res = await axios.get("/api/admin/profile");
    setProfile({ username: res.data.username, password: "", isEditing: false });
    setShowProfileModal(true);
  };

  const updateProfile = async () => {
    try {
      await axios.put("/api/admin/profile", {
        username: profile.username,
        password: profile.password,
      });
      alert("Profile updated!");
      setProfile((prev) => ({ ...prev, isEditing: false }));
    } catch (err) {
      alert("Update failed");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("role");
    router.push("/");
  };

  const completedAssignments = assignments.filter((a) => a.status === "completed").length;
  const completionRate =
    assignments.length > 0 ? Math.round((completedAssignments / assignments.length) * 100) : 0;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h2>Admin Dashboard</h2>
        <div className={styles.actions}>
          <button onClick={() => { setEditGroupId(null); setShowGroupModal(true); }}>Create Group</button>
          <button onClick={() => { setEditAssignmentId(null); setShowAssignmentModal(true); }}>+Create Assignment</button>
          <div className={styles.profile} onClick={openProfile}>Profile</div>
        </div>
      </header>

      <div className={styles.stats}>
        <div className={styles.card}><p>Total Groups</p><h3>{groups.length}</h3></div>
        <div className={styles.card}><p>Active Assignments</p><h3>{assignments.filter(a => a.status !== "completed").length}</h3></div>
        <div className={styles.card}>
          <p>Submissions</p>
          <h3>{assignments.reduce((acc, a) => acc + (Array.isArray(a.submissions) ? a.submissions.length : a.submissions || 0), 0)}</h3>
        </div>
        <div className={styles.card}>
          <p>Completion Rate</p>
          <h3>{completionRate}%</h3>
        </div>
      </div>

      <div className={styles.tabbar}>
        <button className={activeTab === "groups" ? styles.active : ""} onClick={() => setActiveTab("groups")}>Groups Management</button>
        <button className={activeTab === "assignments" ? styles.active : ""} onClick={() => setActiveTab("assignments")}>Assignment Tracking</button>
      </div>

      {activeTab === "groups" && (
        <div className={styles.groupList}>
          {groups.map((group) => {
            const assignment = assignments.find((a) => a.groupId === group._id);
            const groupStatus = assignment?.status === "completed" ? "Completed" : "Pending";

            return (
              <div className={styles.groupCard} key={group._id}>
                <div className={styles.groupHeader}>
                  <h4>{group.name}</h4>
                  <div className={styles.statusWithActions}>
                    <span className={styles.status} style={{ color: groupStatus === "Completed" ? "green" : "orange" }}>
                      {groupStatus}
                    </span>
                    <button className={styles.iconBtn} onClick={() => handleEditGroup(group)}>✏️</button>
                    <button className={styles.iconBtn} onClick={() => handleDeleteGroup(group._id)}>🗑️</button>
                  </div>
                </div>
                <div>
                  <p>Members</p>
                  <div className={styles.members}>
                    {group.members.map((m, i) => <span key={i}>{m}</span>)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === "assignments" && (
        <div className={styles.groupList}>
          {assignments.map((assignment) => {
            const group = groups.find((g) => g._id === assignment.groupId);
            const totalSubmissions = Array.isArray(assignment.submissions) ? assignment.submissions.length : assignment.submissions || 0;
            const progress = Math.round((totalSubmissions / (assignment.totalMembers || 1)) * 100);

            return (
              <div className={styles.groupCard} key={assignment._id}>
                <div className={styles.groupHeader}>
                  <h4>{assignment.title}</h4>
                  <div className={styles.statusWithActions}>
                    <span className={styles.status} style={{ color: assignment.status === "completed" ? "green" : "orange" }}>
                      {assignment.status}
                    </span>
                    <button className={styles.iconBtn} onClick={() => handleEditAssignment(assignment)}>✏️</button>
                    <button className={styles.iconBtn} onClick={() => handleDeleteAssignment(assignment._id)}>🗑️</button>
                  </div>
                </div>
                <div>
                  <p>Group: {group?.name || "N/A"}</p>
                  <p>Deadline: {assignment.deadline}</p>
                  <p>{assignment.description}</p>
                  <p>Progress: {totalSubmissions}/{assignment.totalMembers} ({progress}%)</p>
                  <div className={styles.progressBarWrapper}>
                    <div className={styles.progressBar} style={{ width: `${progress}%` }}></div>
                  </div>

                  {Array.isArray(assignment.submissions) && assignment.submissions.length > 0 && (
                    <div style={{ marginTop: '1rem' }}>
                      <strong>Submissions:</strong>
                      <ul style={{ paddingLeft: '1.5rem' }}>
                        {assignment.submissions.map((s, i) => (
                          <li key={i}>
                            <strong>{s.username}</strong> ({s.email})<br />
                            📝 <em>{s.submissionText}</em>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showGroupModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalBox}>
            <h3>{editGroupId ? "Edit Group" : "Create New Group"}</h3>
            <label>Group Name</label>
            <input
              type="text"
              value={newGroup.name}
              onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
            />
            <label>Members (comma-separated)</label>
            <textarea
              value={newGroup.members}
              onChange={(e) => setNewGroup({ ...newGroup, members: e.target.value })}
            />
            <button onClick={createOrUpdateGroup}>
              {editGroupId ? "Update Group" : "Create Group"}
            </button>
            <button className={styles.cancelBtn} onClick={() => setShowGroupModal(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Assignment Modal */}
      {showAssignmentModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalBox}>
            <h3>{editAssignmentId ? "Edit Assignment" : "Create New Assignment"}</h3>
            <label>Title</label>
            <input
              type="text"
              value={newAssignment.title}
              onChange={(e) => setNewAssignment({ ...newAssignment, title: e.target.value })}
            />
            <label>Description</label>
            <textarea
              value={newAssignment.description}
              onChange={(e) => setNewAssignment({ ...newAssignment, description: e.target.value })}
            />
            <label>Deadline</label>
            <input
              type="date"
              value={newAssignment.deadline}
              onChange={(e) => setNewAssignment({ ...newAssignment, deadline: e.target.value })}
            />
            <label>Assign to Group</label>
            <select
              value={newAssignment.groupId}
              onChange={(e) => setNewAssignment({ ...newAssignment, groupId: e.target.value })}
            >
              <option value="">Select a group</option>
              {groups.map((group) => (
                <option key={group._id} value={group._id}>{group.name}</option>
              ))}
            </select>
            <button onClick={createOrUpdateAssignment}>
              {editAssignmentId ? "Update Assignment" : "Create Assignment"}
            </button>
            <button className={styles.cancelBtn} onClick={() => setShowAssignmentModal(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Profile Modal */}
      {showProfileModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalBox}>
            <h3>Admin Profile</h3>
            <label>Username</label>
            <input
              type="text"
              value={profile.username}
              onChange={(e) => setProfile({ ...profile, username: e.target.value })}
              readOnly={!profile.isEditing}
            />
            <label>Password</label>
            <input
              type="password"
              value={profile.password}
              onChange={(e) => setProfile({ ...profile, password: e.target.value })}
              readOnly={!profile.isEditing}
              placeholder={profile.isEditing ? "Enter new password" : "********"}
            />
            {!profile.isEditing ? (
              <button onClick={() => setProfile({ ...profile, isEditing: true })}>Edit</button>
            ) : (
              <button onClick={updateProfile}>Save</button>
            )}
            <button className={styles.cancelBtn} onClick={handleLogout}>Logout</button>
            <button className={styles.cancelBtn} onClick={() => setShowProfileModal(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
  