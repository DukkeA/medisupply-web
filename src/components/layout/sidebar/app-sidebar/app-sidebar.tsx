'use client'

import * as React from 'react'
import {
  BookOpen,
  Bot,
  FlaskConical,
  Frame,
  LifeBuoy,
  Map,
  PieChart,
  Send,
  Settings2,
  SquareTerminal
} from 'lucide-react'

import { NavMain } from '@/components/layout/sidebar/nav-main'
// import { NavProjects } from '@/components/layout/sidebar/nav-projects'
// import { NavSecondary } from '@/components/layout/sidebar/nav-secondary'
import { NavUser } from '@/components/layout/sidebar/nav-user'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from '@/components/ui/sidebar'

const data = {
  user: {
    name: 'shadcn',
    email: 'm@example.com',
    avatar: '/avatars/shadcn.jpg'
  },
  navMain: [
    {
      title: 'Providers',
      url: '/providers',
      icon: SquareTerminal,
      isActive: true,
      items: []
    },
    {
      title: 'Products',
      url: '/products',
      icon: Bot,
      items: []
    },
    {
      title: 'Vendors',
      url: '/vendors',
      icon: BookOpen,
      isActive: true,
      items: [
        {
          title: 'Manage Vendors',
          url: '/vendors'
        },
        {
          title: 'Vendors Plans',
          url: '/vendors/plans'
        }
      ]
    },
    {
      title: 'Reports',
      url: '/reports',
      icon: Settings2,
      isActive: true,
      items: [
        {
          title: 'Overview',
          url: '/reports'
        },
        {
          title: 'Generate Report',
          url: '/reports/generate'
        }
      ]
    },
    {
      title: 'Inventory',
      url: '/inventory',
      icon: Settings2,
      isActive: true,
      items: [
        {
          title: 'Items',
          url: '/inventory'
        },
        {
          title: 'Warehouses',
          url: '/inventory/warehouses'
        }
      ]
    },
    {
      title: 'Routes',
      url: '/routes',
      icon: Settings2,
      items: []
    }
  ],
  navSecondary: [
    {
      title: 'Support',
      url: '#',
      icon: LifeBuoy
    },
    {
      title: 'Feedback',
      url: '#',
      icon: Send
    }
  ],
  projects: [
    {
      name: 'Design Engineering',
      url: '#',
      icon: Frame
    },
    {
      name: 'Sales & Marketing',
      url: '#',
      icon: PieChart
    },
    {
      name: 'Travel',
      url: '#',
      icon: Map
    }
  ]
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <FlaskConical className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">Medisupply</span>
                  <span className="truncate text-xs">Uniandes</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        {/* <NavProjects projects={data.projects} /> */}
        {/* <NavSecondary items={data.navSecondary} className="mt-auto" /> */}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
