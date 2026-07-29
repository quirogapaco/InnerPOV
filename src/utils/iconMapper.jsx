import React from 'react';
import {
  Heart,
  Cake,
  GraduationCap,
  Briefcase,
  Sparkles,
  MoreHorizontal,
} from 'lucide-react';

const ICON_MAP = {
  Heart,
  Cake,
  GraduationCap,
  Briefcase,
  Sparkles,
  MoreHorizontal,
};

export function renderIcon(iconName, props = {}) {
  const IconComponent = ICON_MAP[iconName] || Sparkles;
  return <IconComponent {...props} />;
}