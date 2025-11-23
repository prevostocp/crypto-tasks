import type { User, Task } from '../types'

interface SidebarProps {
  user: User;
  tasks: Task[];
}

function Sidebar({user, taks}:SidebarProps) {
  return (
    <div>sidebar</div>
  )
}

export default Sidebar