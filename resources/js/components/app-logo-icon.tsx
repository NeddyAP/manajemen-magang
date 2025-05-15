export default function AppLogoIcon({
    width = 165,
    height = 35,
    className,
}: {
    width?: number;
    height?: number;
    className?: string;
}) {
    return <img src="/assets/logo.svg" width={width} height={height} alt="" className={className} />;
}
