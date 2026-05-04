"""
session_store.py — Session Management
====================================
Stores user sessions with GitHub access tokens.
Simple in-memory store for demo - would use Redis/DB in production.
"""

import time
import secrets
from typing import Optional, Dict, Any
from dataclasses import dataclass


@dataclass
class UserSession:
    """User session data."""
    user_id: int
    github_username: str
    access_token: str
    created_at: float


class SessionStore:
    """In-memory session storage."""

    def __init__(self):
        self.sessions: Dict[str, UserSession] = {}
        self.session_ttl = 24 * 60 * 60  # 24 hours

    def create_session(self, user_id: int, github_username: str, access_token: str) -> str:
        """
        Create new user session.

        Args:
            user_id: GitHub user ID
            github_username: GitHub username
            access_token: GitHub access token

        Returns:
            Session ID
        """
        session_id = secrets.token_urlsafe(32)

        session = UserSession(
            user_id=user_id,
            github_username=github_username,
            access_token=access_token,
            created_at=time.time()
        )

        self.sessions[session_id] = session
        return session_id

    def get_session(self, session_id: str) -> Optional[UserSession]:
        """
        Get session by ID.

        Args:
            session_id: Session ID

        Returns:
            UserSession if valid, None if not found or expired
        """
        if session_id not in self.sessions:
            return None

        session = self.sessions[session_id]

        # Check if expired
        if time.time() - session.created_at > self.session_ttl:
            del self.sessions[session_id]
            return None

        return session

    def delete_session(self, session_id: str) -> bool:
        """
        Delete session.

        Args:
            session_id: Session ID to delete

        Returns:
            True if deleted, False if not found
        """
        if session_id in self.sessions:
            del self.sessions[session_id]
            return True
        return False

    def cleanup_expired_sessions(self):
        """Remove expired sessions."""
        now = time.time()
        expired = [
            sid for sid, session in self.sessions.items()
            if now - session.created_at > self.session_ttl
        ]

        for sid in expired:
            del self.sessions[sid]


# Global session store
session_store = SessionStore()