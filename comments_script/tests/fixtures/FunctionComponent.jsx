import React, { useState, useEffect } from 'react';

function UserProfile({ userId, onUpdate }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchUserData() {
      try {
        setLoading(true);
        const response = await fetch(`/api/users/${userId}`);

        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }

        const userData = await response.json();
        setUser(userData);
        setError(null);
      } catch (err) {
        setError(err.message);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    if (userId) {
      fetchUserData();
    }

    return () => {
      // Cleanup function
    };
  }, [userId]);

  function handleUpdateUser(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const userData = {
      name: formData.get('name'),
      email: formData.get('email'),
      bio: formData.get('bio')
    };

    onUpdate(userData);
  }

  if (loading) {
    return <div className="profile-loading">Loading user data...</div>;
  }

  if (error) {
    return <div className="profile-error">Error: {error}</div>;
  }

  if (!user) {
    return <div className="profile-empty">No user data available</div>;
  }

  return (
    <div className="user-profile">
      <header className="profile-header">
        <h1>{user.name}</h1>
        <p className="email">{user.email}</p>
      </header>

      <section className="profile-body">
        <div className="avatar-container">
          <img
            src={user.avatarUrl || '/default-avatar.png'}
            alt={`${user.name}'s profile picture`}
            className="avatar"
          />
        </div>

        <div className="user-details">
          <p className="bio">{user.bio}</p>

          <div className="stats">
            <div className="stat">
              <span className="stat-label">Posts</span>
              <span className="stat-value">{user.postCount}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Followers</span>
              <span className="stat-value">{user.followerCount}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Following</span>
              <span className="stat-value">{user.followingCount}</span>
            </div>
          </div>
        </div>
      </section>

      <form className="edit-profile-form" onSubmit={handleUpdateUser}>
        <div className="form-field">
          <label htmlFor="name">Name</label>
          <input
            type="text"
            id="name"
            name="name"
            defaultValue={user.name}
            required
          />
        </div>

        <div className="form-field">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            defaultValue={user.email}
            required
          />
        </div>

        <div className="form-field">
          <label htmlFor="bio">Bio</label>
          <textarea
            id="bio"
            name="bio"
            defaultValue={user.bio}
            rows={4}
          />
        </div>

        <button type="submit" className="update-button">
          Update Profile
        </button>
      </form>
    </div>
  );
}

export default UserProfile;