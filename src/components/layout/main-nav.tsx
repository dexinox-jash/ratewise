'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils/cn';
import { Calculator, LayoutDashboard, CreditCard } from 'lucide-react';

const navItems = [
  {
    title: 'Calculator',
    href: '/calculator',
    icon: Calculator,
  },
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Upgrade',
    href: '/upgrade',
    icon: CreditCard,
  },
];

export function MainNav() {
  const pathname = usePathname();

  return (
    <div className="flex items-center gap-6 md:gap-10">
      <Link href="/" className="flex items-center space-x-2">
        <span className="text-xl font-bold">RateWise</span>
      </Link>
      <nav className="hidden gap-6 md:flex">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center text-sm font-medium transition-colors hover:text-primary',
              pathname === item.href
                ? 'text-foreground'
                : 'text-muted-foreground'
            )}
          >
            <item.icon className="mr-2 h-4 w-4" />
            {item.title}
          </Link>
        ))}
      </nav>
    </div>
  );
}
