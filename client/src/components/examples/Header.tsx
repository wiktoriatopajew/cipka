import Header from '../Header';

export default function HeaderExample() {
  const mockUser = {
    name: 'John Doe',
    email: 'john@example.com'
  };

  return (
    <Header 
      user={mockUser}
      onLogin={() => console.log('Login clicked')}
      onLogout={() => console.log('Logout clicked')}
      onOpenAdmin={() => console.log('Admin clicked')}
    />
  );
}