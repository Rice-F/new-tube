interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({children}:LayoutProps) => {
  return (
    <div>
      <div>this is a feed nav bar</div>
      {children}
    </div>
  );
}

export default Layout;