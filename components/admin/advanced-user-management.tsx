"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Checkbox } from "@/components/ui/checkbox"
import { AdminService } from "@/lib/admin"
import { DatabaseService } from "@/lib/database"
import { useRealtimeUsers } from "@/hooks/use-realtime-data"
import type { User } from "@/types"
import { Plus, Edit, Trash2, Search, Filter, Download } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

export function AdvancedUserManagement() {
  const { users: realtimeUsers, loading: realtimeLoading } = useRealtimeUsers()
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [newUserData, setNewUserData] = useState({
    email: "",
    password: "",
    displayName: "",
    isAdmin: false,
  })

  useEffect(() => {
    setUsers(realtimeUsers)
    setFilteredUsers(realtimeUsers)
  }, [realtimeUsers])

  useEffect(() => {
    let filtered = users

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Status filter
    if (statusFilter !== "all") {
      const now = new Date()
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

      filtered = filtered.filter((user) => {
        const isActive = user.lastLogin && user.lastLogin > thirtyDaysAgo
        return statusFilter === "active" ? isActive : !isActive
      })
    }

    setFilteredUsers(filtered)
  }, [users, searchTerm, statusFilter])

  const handleCreateUser = async () => {
    if (!newUserData.email || !newUserData.password) return

    const result = await AdminService.createUser(newUserData.email, newUserData.password, newUserData.displayName)

    if (result.success) {
      setIsCreateDialogOpen(false)
      setNewUserData({ email: "", password: "", displayName: "", isAdmin: false })
    }
  }

  const handleEditUser = async () => {
    if (!editingUser) return

    const result = await DatabaseService.updateUser(editingUser.uid, {
      displayName: editingUser.displayName,
      isAdmin: editingUser.isAdmin,
    })

    if (result.success) {
      setIsEditDialogOpen(false)
      setEditingUser(null)
    }
  }

  const handleDeleteUser = async (uid: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return

    const result = await AdminService.deleteUser(uid)
    if (result.success) {
      // Users will be updated via real-time subscription
    }
  }

  const handleBulkAction = async (action: string) => {
    if (selectedUsers.length === 0) return

    switch (action) {
      case "delete":
        if (!confirm(`Are you sure you want to delete ${selectedUsers.length} users?`)) return
        // Implement bulk delete
        break
      case "activate":
        // Implement bulk activate
        break
      case "deactivate":
        // Implement bulk deactivate
        break
    }

    setSelectedUsers([])
  }

  const handleSelectUser = (uid: string, checked: boolean) => {
    if (checked) {
      setSelectedUsers([...selectedUsers, uid])
    } else {
      setSelectedUsers(selectedUsers.filter((id) => id !== uid))
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUsers(filteredUsers.map((user) => user.uid))
    } else {
      setSelectedUsers([])
    }
  }

  const exportUsers = () => {
    const csvContent = [
      ["Email", "Display Name", "Admin", "Created At", "Last Login", "Email Accounts"].join(","),
      ...filteredUsers.map((user) =>
        [
          user.email,
          user.displayName || "",
          user.isAdmin ? "Yes" : "No",
          user.createdAt.toISOString(),
          user.lastLogin?.toISOString() || "",
          user.emailAccounts?.length || 0,
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "users.csv"
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (realtimeLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading users...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">User Management</h2>
          <p className="text-muted-foreground">Manage user accounts and permissions</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={exportUsers}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create User
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New User</DialogTitle>
                <DialogDescription>Create a new user account for the email system.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newUserData.email}
                    onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                    placeholder="user@animxo.com"
                  />
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={newUserData.password}
                    onChange={(e) => setNewUserData({ ...newUserData, password: e.target.value })}
                    placeholder="Enter password"
                  />
                </div>
                <div>
                  <Label htmlFor="displayName">Display Name (Optional)</Label>
                  <Input
                    id="displayName"
                    value={newUserData.displayName}
                    onChange={(e) => setNewUserData({ ...newUserData, displayName: e.target.value })}
                    placeholder="John Doe"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isAdmin"
                    checked={newUserData.isAdmin}
                    onCheckedChange={(checked) => setNewUserData({ ...newUserData, isAdmin: checked as boolean })}
                  />
                  <Label htmlFor="isAdmin">Administrator privileges</Label>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleCreateUser} disabled={!newUserData.email || !newUserData.password}>
                  Create User
                </Button>
                {user.lastLogin && user.lastLogin > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) && (
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Users</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Bulk Actions */}
      {selectedUsers.length > 0 && (
        <div className="flex items-center gap-2 p-4 bg-muted rounded-lg">
          <span className="text-sm font-medium">{selectedUsers.length} users selected</span>
          <Button size="sm" variant="outline" onClick={() => handleBulkAction("delete")}>
            Delete Selected
          </Button>
          <Button size="sm" variant="outline" onClick={() => setSelectedUsers([])}>
            Clear Selection
          </Button>
        </div>
      )}

      {/* Users Table */}
      <div className="border border-border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead>User</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Email Accounts</TableHead>
              <TableHead>Last Login</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.uid}>
                <TableCell>
                  <Checkbox
                    checked={selectedUsers.includes(user.uid)}
                    onCheckedChange={(checked) => handleSelectUser(user.uid, checked as boolean)}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {user.email.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{user.displayName || user.email}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Badge variant={user.isAdmin ? "default" : "secondary"}>{user.isAdmin ? "Admin" : "User"}</Badge>
                    {user.lastLogin && new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) < user.lastLogin && (
                      <Badge variant="outline" className="text-green-600">
                        Active
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>{user.emailAccounts?.length || 0}</TableCell>
                <TableCell>
                  {user.lastLogin ? formatDistanceToNow(user.lastLogin, { addSuffix: true }) : "Never"}
                </TableCell>
                <TableCell>{formatDistanceToNow(user.createdAt, { addSuffix: true })}</TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditingUser(user)
                        setIsEditDialogOpen(true)
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteUser(user.uid)}
                      disabled={user.isAdmin}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Update user information and permissions.</DialogDescription>
          </DialogHeader>
          {editingUser && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="editEmail">Email</Label>
                <Input id="editEmail" value={editingUser.email} disabled />
              </div>
              <div>
                <Label htmlFor="editDisplayName">Display Name</Label>
                <Input
                  id="editDisplayName"
                  value={editingUser.displayName || ""}
                  onChange={(e) => setEditingUser({ ...editingUser, displayName: e.target.value })}
                  placeholder="John Doe"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="editIsAdmin"
                  checked={editingUser.isAdmin}
                  onCheckedChange={(checked) => setEditingUser({ ...editingUser, isAdmin: checked as boolean })}
                />
                <Label htmlFor="editIsAdmin">Administrator privileges</Label>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={handleEditUser}>Update User</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
