interface HeaderProps {
    onReset: () => void;
    html: string;
    onOpenImageSearch?: () => void;
}
declare function Header({ onReset, html, onOpenImageSearch }: HeaderProps): import("react/jsx-runtime").JSX.Element;
export default Header;
