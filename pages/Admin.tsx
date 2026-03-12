export const meta = {
  label: 'Admin',
  icon: 'Lock',
  order: 2,
  menu: ['admin'],
  route: (roles) => roles.includes('test'),
}

export default function Admin() {
  return (
    <div className="p-6">
      <div className="text-2xl font-semibold">Admin</div>
      <div className="text-sm text-muted-foreground">Only roles in route/menu can access this page.</div>
    </div>
  )
}

