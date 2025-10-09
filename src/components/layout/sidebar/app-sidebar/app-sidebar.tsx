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
import { useTranslations } from 'next-intl'

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const t = useTranslations('sidebar')

  const data = {
    user: {
      name: 'shadcn',
      email: 'm@example.com',
      avatar: '/avatars/shadcn.jpg'
    },
    navMain: [
      {
        title: t('providers'),
        url: '/providers',
        icon: SquareTerminal,
        isActive: true,
        items: []
      },
      {
        title: t('products'),
        url: '/products',
        icon: Bot,
        items: []
      },
      {
        title: t('vendors'),
        url: '/vendors',
        icon: BookOpen,
        isActive: true,
        items: [
          {
            title: t('manage-vendors'),
            url: '/vendors'
          },
          {
            title: t('vendors-plans'),
            url: '/vendors/plans'
          }
        ]
      },
      {
        title: t('reports'),
        url: '/reports',
        icon: Settings2,
        isActive: true,
        items: [
          {
            title: t('overview'),
            url: '/reports'
          },
          {
            title: t('generate-report'),
            url: '/reports/generate'
          }
        ]
      },
      {
        title: t('inventory'),
        url: '/inventory',
        icon: Settings2,
        isActive: true,
        items: [
          {
            title: t('items'),
            url: '/inventory'
          },
          {
            title: t('warehouses'),
            url: '/inventory/warehouses'
          }
        ]
      },
      {
        title: t('routes'),
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
