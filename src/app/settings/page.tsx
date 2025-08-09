"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Sidebar from "@/components/Sidebar";
import {
  UserIcon,
  LockClosedIcon,
  BellIcon,
  DevicePhoneMobileIcon,
  ShieldCheckIcon,
  TrashIcon,
  EyeIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/outline";

export default function SettingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [showPassword, setShowPassword] = useState(false);

  // Form states (will be connected to API later)
  const [profileData, setProfileData] = useState({
    username: user?.username || "",
    bio: user?.bio || "",
    avatarUrl: user?.avatarUrl || "",
  });

  const [privacySettings, setPrivacySettings] = useState({
    isPrivateAccount: false,
    allowDuets: true,
    allowComments: true,
    allowDirectMessages: true,
  });

  const [notificationSettings, setNotificationSettings] = useState({
    pushNotifications: true,
    emailNotifications: false,
    followNotifications: true,
    likeNotifications: true,
    commentNotifications: true,
  });

  const tabs = [
    { id: "profile", label: "Profile", icon: UserIcon },
    { id: "privacy", label: "Privacy & Safety", icon: LockClosedIcon },
    { id: "notifications", label: "Notifications", icon: BellIcon },
    { id: "account", label: "Account", icon: ShieldCheckIcon },
  ];

  const handleSave = () => {
    // TODO: Implement save functionality
    console.log("Settings saved");
  };

  const handleDeleteAccount = () => {
    // TODO: Implement account deletion
    console.log("Delete account requested");
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar currentPage="settings" />

      <div className="flex-1 max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account preferences and privacy settings
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Tabs */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-card text-card-foreground border border-border rounded-lg shadow p-4">
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center px-3 py-2 rounded-lg text-left transition-colors focus:outline-none focus:ring-2 focus:ring-ring ${
                        activeTab === tab.id
                          ? "bg-accent text-accent-foreground border border-border"
                          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                      }`}
                      aria-current={activeTab === tab.id ? "page" : undefined}
                    >
                      <Icon className="w-5 h-5 mr-3" />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-card text-card-foreground border border-border rounded-lg shadow">
              {/* Profile Settings */}
              {activeTab === "profile" && (
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-foreground mb-6">
                    Profile Information
                  </h2>

                  {/* Avatar */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                      Profile Picture
                    </label>
                    <div className="flex items-center space-x-4">
                      <div className="w-20 h-20 bg-muted rounded-full overflow-hidden">
                        {profileData.avatarUrl ? (
                          <img
                            src={profileData.avatarUrl}
                            alt="Profile"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-muted flex items-center justify-center text-foreground text-2xl">
                            {profileData.username.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div>
                        <button className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors focus:outline-none focus:ring-2 focus:ring-ring">
                          Change Photo
                        </button>
                        <p className="text-sm text-muted-foreground mt-1">
                          JPG, PNG up to 10MB
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Username */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                      Username
                    </label>
                    <input
                      type="text"
                      value={profileData.username}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          username: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-input bg-background text-foreground placeholder:text-muted-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>

                  {/* Bio */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                      Bio
                    </label>
                    <textarea
                      value={profileData.bio}
                      onChange={(e) =>
                        setProfileData({ ...profileData, bio: e.target.value })
                      }
                      rows={4}
                      className="w-full px-3 py-2 border border-input bg-background text-foreground placeholder:text-muted-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                      placeholder="Tell people about yourself..."
                    />
                  </div>
                </div>
              )}

              {/* Privacy Settings */}
              {activeTab === "privacy" && (
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-foreground mb-6">
                    Privacy & Safety
                  </h2>

                  <div className="space-y-6">
                    {/* Private Account */}
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-foreground">
                          Private Account
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Only approved followers can see your content
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={privacySettings.isPrivateAccount}
                          onChange={(e) =>
                            setPrivacySettings({
                              ...privacySettings,
                              isPrivateAccount: e.target.checked,
                            })
                          }
                          className="sr-only peer"
                          aria-checked={privacySettings.isPrivateAccount}
                        />
                        <div className="w-11 h-6 bg-input peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-ring rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-background after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-background after:border-input after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>

                    {/* Allow Duets */}
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-foreground">
                          Allow Duets
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Let others duet with your videos
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={privacySettings.allowDuets}
                          onChange={(e) =>
                            setPrivacySettings({
                              ...privacySettings,
                              allowDuets: e.target.checked,
                            })
                          }
                          className="sr-only peer"
                          aria-checked={privacySettings.allowDuets}
                        />
                        <div className="w-11 h-6 bg-input peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-ring rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-background after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-background after:border-input after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>

                    {/* Allow Comments */}
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-foreground">
                          Allow Comments
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Let others comment on your videos
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={privacySettings.allowComments}
                          onChange={(e) =>
                            setPrivacySettings({
                              ...privacySettings,
                              allowComments: e.target.checked,
                            })
                          }
                          className="sr-only peer"
                          aria-checked={privacySettings.allowComments}
                        />
                        <div className="w-11 h-6 bg-input peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-ring rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-background after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-background after:border-input after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>

                    {/* Allow Direct Messages */}
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-foreground">
                          Allow Direct Messages
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Let others send you direct messages
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={privacySettings.allowDirectMessages}
                          onChange={(e) =>
                            setPrivacySettings({
                              ...privacySettings,
                              allowDirectMessages: e.target.checked,
                            })
                          }
                          className="sr-only peer"
                          aria-checked={privacySettings.allowDirectMessages}
                        />
                        <div className="w-11 h-6 bg-input peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-ring rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-background after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-background after:border-input after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Notification Settings */}
              {activeTab === "notifications" && (
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-foreground mb-6">
                    Notification Preferences
                  </h2>

                  <div className="space-y-6">
                    {/* Push Notifications */}
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-foreground">
                          Push Notifications
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Receive notifications on your device
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notificationSettings.pushNotifications}
                          onChange={(e) =>
                            setNotificationSettings({
                              ...notificationSettings,
                              pushNotifications: e.target.checked,
                            })
                          }
                          className="sr-only peer"
                          aria-checked={notificationSettings.pushNotifications}
                        />
                        <div className="w-11 h-6 bg-input peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-ring rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-background after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-background after:border-input after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>

                    {/* Email Notifications */}
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-foreground">
                          Email Notifications
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Receive notifications via email
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notificationSettings.emailNotifications}
                          onChange={(e) =>
                            setNotificationSettings({
                              ...notificationSettings,
                              emailNotifications: e.target.checked,
                            })
                          }
                          className="sr-only peer"
                          aria-checked={notificationSettings.emailNotifications}
                        />
                        <div className="w-11 h-6 bg-input peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-ring rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-background after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-background after:border-input after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>

                    {/* Follow Notifications */}
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-foreground">
                          New Followers
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          When someone follows you
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notificationSettings.followNotifications}
                          onChange={(e) =>
                            setNotificationSettings({
                              ...notificationSettings,
                              followNotifications: e.target.checked,
                            })
                          }
                          className="sr-only peer"
                          aria-checked={notificationSettings.followNotifications}
                        />
                        <div className="w-11 h-6 bg-input peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-ring rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-background after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-background after:border-input after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>

                    {/* Like Notifications */}
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-foreground">Likes</h3>
                        <p className="text-sm text-muted-foreground">
                          When someone likes your videos
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notificationSettings.likeNotifications}
                          onChange={(e) =>
                            setNotificationSettings({
                              ...notificationSettings,
                              likeNotifications: e.target.checked,
                            })
                          }
                          className="sr-only peer"
                          aria-checked={notificationSettings.likeNotifications}
                        />
                        <div className="w-11 h-6 bg-input peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-ring rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-background after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-background after:border-input after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>

                    {/* Comment Notifications */}
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-foreground">Comments</h3>
                        <p className="text-sm text-muted-foreground">
                          When someone comments on your videos
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notificationSettings.commentNotifications}
                          onChange={(e) =>
                            setNotificationSettings({
                              ...notificationSettings,
                              commentNotifications: e.target.checked,
                            })
                          }
                          className="sr-only peer"
                          aria-checked={notificationSettings.commentNotifications}
                        />
                        <div className="w-11 h-6 bg-input peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-ring rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-background after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-background after:border-input after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Account Settings */}
              {activeTab === "account" && (
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-foreground mb-6">
                    Account Management
                  </h2>

                  <div className="space-y-6">
                    {/* Change Password */}
                    <div className="border border-border rounded-lg p-4">
                      <h3 className="font-medium text-foreground mb-4">
                        Change Password
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-muted-foreground mb-2">
                            Current Password
                          </label>
                          <div className="relative">
                            <input
                              type={showPassword ? "text" : "password"}
                              className="w-full px-3 py-2 pr-10 border border-input bg-background text-foreground placeholder:text-muted-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-2 top-2 text-muted-foreground hover:text-foreground focus:outline-none"
                              aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                              {showPassword ? (
                                <EyeSlashIcon className="w-5 h-5" />
                              ) : (
                                <EyeIcon className="w-5 h-5" />
                              )}
                            </button>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-muted-foreground mb-2">
                            New Password
                          </label>
                          <input
                            type="password"
                            className="w-full px-3 py-2 border border-input bg-background text-foreground placeholder:text-muted-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-muted-foreground mb-2">
                            Confirm New Password
                          </label>
                          <input
                            type="password"
                            className="w-full px-3 py-2 border border-input bg-background text-foreground placeholder:text-muted-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                          />
                        </div>
                        <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-ring">
                          Update Password
                        </button>
                      </div>
                    </div>

                    {/* Delete Account */}
                    <div className="border border-border rounded-lg p-4 bg-accent">
                      <h3 className="font-medium text-foreground mb-2">
                        Delete Account
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Once you delete your account, there is no going back.
                        Please be certain.
                      </p>
                      <button
                        onClick={handleDeleteAccount}
                        className="flex items-center px-4 py-2 bg-destructive text-white rounded-lg hover:bg-destructive/90 transition-colors focus:outline-none focus:ring-2 focus:ring-destructive/20"
                      >
                        <TrashIcon className="w-4 h-4 mr-2" />
                        Delete Account
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Save Button */}
              <div className="px-6 py-4 bg-accent border-t border-border rounded-b-lg">
                <div className="flex justify-end space-x-4">
                  <button className="px-4 py-2 text-foreground border border-border rounded-lg hover:bg-accent transition-colors focus:outline-none focus:ring-2 focus:ring-ring">
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
