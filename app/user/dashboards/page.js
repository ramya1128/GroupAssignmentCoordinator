  'use client';

  import { useEffect, useState } from "react";
  import { useRouter } from "next/navigation";
  import axios from "axios";
  import styles from "./UserDashboard.module.css";

  const UserDashboard = () => {
    const router = useRouter();
    const [user, setUser] = useState({ username: "", email: "", password: "", isEditing: false });
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [assignments, setAssignments] = useState([]);
    const [groups, setGroups] = useState([]);
    const [activeTab, setActiveTab] = useState("assignments");
    const [submissionText, setSubmissionText] = useState("");
    const [selectedAssignmentId, setSelectedAssignmentId] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
      const email = localStorage.getItem("email");
      if (!email) {
        router.push("/user/login");
      } else {
        fetchUser(email);
      }
    }, []);

    const fetchUser = async (email) => {
      try {
        const res = await axios.get(`/api/user/profile?email=${email}`);
        const { user, assignments, groups } = res.data;
        setUser({ ...user, password: "", isEditing: false });
        setAssignments(assignments);
        setGroups(groups);
      } catch (err) {
        console.error("Failed to fetch user profile:", err);
      }
    };

    const openProfile = async () => {
      try {
        const email = localStorage.getItem("email");
        const res = await axios.get(`/api/user/profile?email=${email}`);
        setUser({
          email: res.data.user.email,
          username: res.data.user.username,
          password: "",
          isEditing: false
        });
        setShowProfileModal(true);
      } catch (err) {
        console.error("Failed to fetch profile:", err);
      }
    };

    const updateProfile = async () => {
      try {
        await axios.put("/api/user/profile", {
          email: user.email,
          username: user.username,
          password: user.password,
        });
        alert("Profile updated!");
        setUser((prev) => ({ ...prev, isEditing: false }));
      } catch (err) {
        alert("Update failed");
      }
    };

    const handleLogout = () => {
      localStorage.removeItem("email");
      router.push("/");
    };

    const handleSubmit = async (assignmentId) => {
      try {
        const method = isEditing ? 'PUT' : 'POST';

        await axios({
          method,
          url: `/api/assignments/${assignmentId}/submit`,
          data: {
            email: user.email,
            submissionText,
          },
        });

        fetchUser(user.email);
        setSelectedAssignmentId(null);
        setSubmissionText("");
        setIsEditing(false);
      } catch (error) {
        alert("Failed to submit assignment");
        console.error("Submission Error:", error);
      }
    };

    const handleDelete = async (assignmentId) => {
      if (!window.confirm("Are you sure you want to delete this submission?")) return;

      try {
        await axios.delete(`/api/assignments/${assignmentId}/submit`, {
          data: { email: user.email },
        });

        fetchUser(user.email);
        setSubmissionText("");
        setSelectedAssignmentId(null);
        setIsEditing(false);
      } catch (error) {
        alert("Failed to delete submission");
        console.error("Delete Error:", error);
      }
    };

    return (
      <div className={styles.container}>
        <header className={styles.header}>
          <h2>{user.username}</h2>
          <div className={styles.actions}>
            <div className={styles.profile} onClick={openProfile}>Profile</div>
          </div>
        </header>

        <div className={styles.stats}>
          <div className={styles.card}><p>Total Assignments</p><h3>{assignments.length}</h3></div>
          <div className={styles.card}><p>Submitted</p><h3>{assignments.filter(a => a.status === "submitted").length}</h3></div>
          <div className={styles.card}><p>Pending</p><h3>{assignments.filter(a => a.status === "pending").length}</h3></div>
          <div className={styles.card}><p>Groups</p><h3>{groups.length}</h3></div>
        </div>

        <div className={styles.tabbar}>
          <button className={activeTab === "assignments" ? styles.active : ""} onClick={() => setActiveTab("assignments")}>Assignments</button>
          <button className={activeTab === "group" ? styles.active : ""} onClick={() => setActiveTab("group")}>Group Details</button>
        </div>

        {activeTab === "assignments" && (
          <div className={styles.groupList}>
            {assignments.map((assignment) => (
              <div className={styles.groupCard} key={assignment._id}>
                <div className={styles.groupHeader}>
                  <h4>{assignment.title}</h4>
                  <span className={styles.status}>{assignment.status}</span>
                </div>
                <p>Deadline: {assignment.deadline}</p>
                <p>Description: {assignment.description}</p>

                {assignment.status === "pending" && (
                  <>
                    {selectedAssignmentId === assignment._id ? (
                      <div className={styles.submissionForm}>
                        <textarea
                          placeholder="Enter submission text"
                          value={submissionText}
                          onChange={(e) => setSubmissionText(e.target.value)}
                        />
                        <button onClick={() => handleSubmit(assignment._id)}>Submit</button>
                        <button className={styles.cancelBtn} onClick={() => {
                          setSelectedAssignmentId(null);
                          setSubmissionText("");
                        }}>Cancel</button>
                      </div>
                    ) : (
                      <button className={styles.submitButton} onClick={() => {
                        setSelectedAssignmentId(assignment._id);
                        setSubmissionText("");
                        setIsEditing(false);
                      }}>Submit Assignment</button>
                    )}
                  </>
                )}

                {assignment.status === "submitted" && (
                  <div className={styles.submittedBox}>
                    <p><strong>Submission:</strong> {assignment.submissionText}</p>
                    {assignment.grade && <p><strong>Grade:</strong> {assignment.grade}</p>}
                    {assignment.feedback && <p><strong>Feedback:</strong> {assignment.feedback}</p>}

                    {selectedAssignmentId === assignment._id && isEditing ? (
                      <div className={styles.submissionForm}>
                        <textarea
                          value={submissionText}
                          onChange={(e) => setSubmissionText(e.target.value)}
                        />
                        <button onClick={() => handleSubmit(assignment._id)}>Update</button>
                        <button className={styles.cancelBtn} onClick={() => {
                          setSelectedAssignmentId(null);
                          setSubmissionText("");
                          setIsEditing(false);
                        }}>Cancel</button>
                      </div>
                    ) : (
                      <div className={styles.cardActions}>
                        <button onClick={() => {
                          setSelectedAssignmentId(assignment._id);
                          setSubmissionText(assignment.submissionText);
                          setIsEditing(true);
                        }}>✏️</button>
                        <button onClick={() => handleDelete(assignment._id)} >🗑️</button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {activeTab === "group" && groups.length > 0 && (
          <div className={styles.groupList}>
            {groups.map((group, index) => {
              const groupAssignments = assignments.filter(a => a.groupId === group._id);
              const submittedCount = groupAssignments.filter(a => a.status === "submitted").length;
              const totalCount = groupAssignments.length;
              const progress = totalCount > 0 ? Math.round((submittedCount / totalCount) * 100) : 0;

              return (
                <div key={index} className={styles.groupCard}>
                  <h4>{group.name}</h4>
                  <p>Members:</p>
                  <div className={styles.members}>
                    {group.members.map((m, i) => (
                      <div key={i} className={styles.memberBox}>
                        <p>{m.username}</p>
                        <p className={styles.email}>{m.email}</p>
                      </div>
                    ))}
                  </div>
                  <div className={styles.progressBarContainer}>
                    <p>Progress ({progress}%)</p>
                    <div className={styles.progressBar}>
                      <div
                        className={styles.progress}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {showProfileModal && (
          <div className={styles.modalOverlay}>
            <div className={styles.modalBox}>
              <h3>User Profile</h3>
              <label>Email</label>
              <input type="text" value={user.email} disabled />

              <label>Username</label>
              <input
                type="text"
                value={user.username}
                onChange={(e) => setUser({ ...user, username: e.target.value })}
                readOnly={!user.isEditing}
              />

              <label>Password</label>
              <input
                type="password"
                value={user.password}
                onChange={(e) => setUser({ ...user, password: e.target.value })}
                readOnly={!user.isEditing}
                placeholder={user.isEditing ? "Enter new password" : "********"}
              />

              {!user.isEditing ? (
                <button onClick={() => setUser({ ...user, isEditing: true })}>Edit</button>
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

  export default UserDashboard;
