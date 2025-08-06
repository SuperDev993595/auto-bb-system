type PageTitleProps = { title: string };

export default function PageTitle({ title }: PageTitleProps) {
    return <h2 className="text-2xl font-bold text-yellow-400 mb-6">{title}</h2>;
}
