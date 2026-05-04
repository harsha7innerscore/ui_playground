"""
auth.py — GitHub OAuth Authentication
====================================
Handles GitHub OAuth flow for user authentication.
Users log in with their GitHub account, we get access token for API calls.
"""

import requests
from urllib.parse import urlencode
from config import config


class GitHubOAuth:
    """Handle GitHub OAuth authentication flow."""

    def __init__(self):
        self.client_id = config.github_client_id
        self.client_secret = config.github_client_secret

    def get_auth_url(self, redirect_uri: str, state: str = None) -> str:
        """
        Generate GitHub OAuth authorization URL.

        Args:
            redirect_uri: Where GitHub redirects after auth
            state: Optional state parameter for CSRF protection

        Returns:
            GitHub OAuth authorization URL
        """
        params = {
            "client_id": self.client_id,
            "redirect_uri": redirect_uri,
            "scope": "read:user user:email repo",  # User info + repo access for PR reviews
        }
        if state:
            params["state"] = state

        return f"https://github.com/login/oauth/authorize?{urlencode(params)}"

    def exchange_code_for_token(self, code: str, redirect_uri: str) -> dict:
        """
        Exchange authorization code for access token.

        Args:
            code: Authorization code from GitHub callback
            redirect_uri: Same redirect_uri used in auth URL

        Returns:
            Token response with access_token, token_type, scope

        Raises:
            Exception: If token exchange fails
        """
        response = requests.post(
            "https://github.com/login/oauth/access_token",
            headers={"Accept": "application/json"},
            data={
                "client_id": self.client_id,
                "client_secret": self.client_secret,
                "code": code,
                "redirect_uri": redirect_uri,
            }
        )

        if response.status_code != 200:
            raise Exception(f"Token exchange failed: {response.status_code}")

        token_data = response.json()

        if "error" in token_data:
            raise Exception(f"OAuth error: {token_data['error']}")

        return token_data

    def get_user_info(self, access_token: str) -> dict:
        """
        Get GitHub user info using access token.

        Args:
            access_token: GitHub access token

        Returns:
            User info dict with login, id, avatar_url, etc.
        """
        response = requests.get(
            "https://api.github.com/user",
            headers={"Authorization": f"Bearer {access_token}"}
        )

        if response.status_code != 200:
            raise Exception(f"Failed to get user info: {response.status_code}")

        return response.json()


# Global OAuth instance
github_oauth = GitHubOAuth()