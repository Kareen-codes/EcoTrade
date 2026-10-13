import HomeNavbar from "../components/HomeNavbar";
import HomeFooter from "../components/HomeFooter";

/**
 * Public site layout: the EcoMate navbar + footer wrapped around the
 * standalone marketing pages (Feed, Playground) so branding stays
 * consistent with the homepage. Auth pages keep their own Layout.
 */
const SiteLayout = ({ children }) => (
  <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900">
    <HomeNavbar />
    <main className="flex-grow">{children}</main>
    <HomeFooter />
  </div>
);

export default SiteLayout;
