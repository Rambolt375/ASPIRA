import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

/**
 * Layout for the public marketing / landing routes.
 * Wraps the page in the shared Navbar + Footer shell.
 */
export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <div className="flex-1 flex flex-col">{children}</div>
      <Footer />
    </>
  );
}
