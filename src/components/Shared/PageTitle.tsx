import { IconType } from 'react-icons';

type PageTitleProps = { 
  title: string; 
  icon?: IconType;
};

export default function PageTitle({ title, icon: Icon }: PageTitleProps) {
    return (
      <div className="flex items-center mb-6">
        {Icon && <Icon className="h-8 w-8 text-primary-600 mr-3" />}
        <h2 className="text-2xl font-bold text-secondary-900">{title}</h2>
      </div>
    );
}
