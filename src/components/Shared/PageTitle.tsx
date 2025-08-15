import { IconType } from 'react-icons';

type PageTitleProps = { 
  title: string; 
  icon?: IconType;
};

export default function PageTitle({ title, icon: Icon }: PageTitleProps) {
    return (
      <div className="flex items-center mb-6">
        {Icon && <Icon className="h-8 w-8 text-yellow-400 mr-3" />}
        <h2 className="text-2xl font-bold text-yellow-400">{title}</h2>
      </div>
    );
}
