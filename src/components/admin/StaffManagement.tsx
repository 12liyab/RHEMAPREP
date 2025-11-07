import { useState, useEffect } from 'react';
import { useFirebaseRead, firebasePush, firebaseDelete } from '../../hooks/useFirebaseSync';
import { Trash2, Plus, Search, Loader2 } from 'lucide-react';
import { StaffMember } from '../../types';

const STAFF_DATA = [
  { name: 'Ann Ayisi', email: 'annayisi60@gmail.com', telephone: '0243054523', role: '' },
  { name: 'Attoh Nuiko Vida', email: 'attohvida299@gmail.com', telephone: '0597030614', role: '' },
  { name: 'Acquaye Melchizedek Nii', email: 'melchizedekacquaye18@gmail.com', telephone: '0248146218', role: '' },
  { name: 'Elizabeth Kyerewaa', email: 'elizabethkyerewaa90@gmail.com', telephone: '0554483500', role: '' },
  { name: 'Augustina Afful', email: 'Tinakay3035@yahoo.com', telephone: '0246291174', role: '' },
  { name: 'Evelyn Larbi', email: 'Evelynboadilarbi@gmail.com', telephone: '0555339606', role: '' },
  { name: 'Anim Darvin', email: 'expensivebrain4@gmail.com', telephone: '0506759057', role: '' },
  { name: 'Debora Alagbo', email: 'debbyvivid@gmail.com', telephone: '0594601090', role: '' },
  { name: 'Edith Kojofio', email: 'Powersjane55@gmail.com', telephone: '0245443661', role: '' },
  { name: 'Agyapong Angela', email: 'agyapongangela86@gmail.com', telephone: '0535331214', role: '' },
  { name: 'Boakye Richard', email: 'Rboakye15@gmail.com', telephone: '0243148969', role: '' },
  { name: 'Sarpong Williams', email: 'williamssarpong041@gmail.com', telephone: '0246908903', role: '' },
  { name: 'Rosemond Tetteh', email: 'rosemondtetteh965@gmail.com', telephone: '0206954981', role: '' },
  { name: 'Boateng Vivian', email: 'vboateng366@gmail.com', telephone: '0245005434', role: '' },
  { name: 'Sandra Odame', email: 'victoria.ansah@rhemaprep.edu', telephone: '0553257156', role: '' },
  { name: 'Boateng Beatrice', email: 'nyame0374@gmail.com', telephone: '0542269394', role: '' },
  { name: 'Wegbah Abigail', email: 'abigailwegbah@gmail.com', telephone: '0277962501', role: '' },
  { name: 'Mary Asiedu', email: 'mary@rhemaprep.edu', telephone: '0554139361', role: '' },
  { name: 'Victoria Azu', email: 'azu00362@gmail.com', telephone: '0573313371', role: '' },
];

export function StaffManagement() {
  const { data: staffData, loading } = useFirebaseRead<Record<string, StaffMember>>('staff');
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [search, setSearch] = useState('');
  const [newStaff, setNewStaff] = useState({ name: '', email: '', telephone: '', role: '' });
  const [showForm, setShowForm] = useState(false);
  const [adding, setAdding] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (staffData) {
      setStaff(Object.entries(staffData).map(([id, member]) => ({ ...member, id })));
    }
  }, [staffData]);

  useEffect(() => {
    const initializeStaff = async () => {
      if (staff.length === 0 && !loading && !initialized) {
        try {
          const existingStaff = staffData ? Object.values(staffData) : [];
          const existingEmails = new Set(existingStaff.map(s => s.email));

          for (const member of STAFF_DATA) {
            if (!existingEmails.has(member.email)) {
              await firebasePush('staff', member);
            }
          }
          setInitialized(true);
        } catch (err) {
          console.error('Error initializing staff:', err);
        }
      }
    };

    initializeStaff();
  }, [staff.length, loading, initialized, staffData]);

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaff.name || !newStaff.email || !newStaff.telephone || !newStaff.role) {
      alert('Please fill in all fields');
      return;
    }

    setAdding(true);
    try {
      await firebasePush('staff', newStaff);
      setNewStaff({ name: '', email: '', telephone: '', role: '' });
      setShowForm(false);
    } catch (err: any) {
      alert('Error adding staff: ' + err.message);
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteStaff = async (id: string) => {
    if (!confirm('Are you sure you want to delete this staff member?')) return;

    try {
      await firebaseDelete(`staff/${id}`);
    } catch (err: any) {
      alert('Error deleting staff: ' + err.message);
    }
  };

  const handleClearDuplicates = async () => {
    if (!confirm('Are you sure you want to clear all duplicate staff members? This will keep only one entry per email.')) return;

    try {
      const emailMap = new Map<string, string[]>(); // email -> [ids]

      staff.forEach((member) => {
        if (!emailMap.has(member.email)) {
          emailMap.set(member.email, []);
        }
        emailMap.get(member.email)!.push(member.id);
      });

      const duplicatesToDelete: string[] = [];

      emailMap.forEach((ids) => {
        if (ids.length > 1) {
          // Keep the first one, delete the rest
          duplicatesToDelete.push(...ids.slice(1));
        }
      });

      for (const id of duplicatesToDelete) {
        await firebaseDelete(`staff/${id}`);
      }

      alert(`Cleared ${duplicatesToDelete.length} duplicate staff members.`);
    } catch (err: any) {
      alert('Error clearing duplicates: ' + err.message);
    }
  };

  const filteredStaff = staff.filter(
    (member) =>
      member.name.toLowerCase().includes(search.toLowerCase()) ||
      member.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading && staff.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Staff Management</h2>
          <div className="flex gap-2">
            <button
              onClick={handleClearDuplicates}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition"
            >
              Clear Duplicates
            </button>
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
            >
              <Plus className="w-5 h-5" />
              Add Staff
            </button>
          </div>
        </div>

        {showForm && (
          <form onSubmit={handleAddStaff} className="mb-6 p-4 bg-gray-50 rounded-lg space-y-3">
            <input
              type="text"
              placeholder="Full Name"
              value={newStaff.name}
              onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            <input
              type="email"
              placeholder="Email"
              value={newStaff.email}
              onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            <input
              type="tel"
              placeholder="Telephone"
              value={newStaff.telephone}
              onChange={(e) => setNewStaff({ ...newStaff, telephone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            <input
              type="text"
              placeholder="Role/Position"
              value={newStaff.role}
              onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={adding}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-3 py-2 rounded-lg transition font-semibold"
              >
                {adding ? 'Adding...' : 'Add'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 bg-gray-400 hover:bg-gray-500 text-white px-3 py-2 rounded-lg transition font-semibold"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        <div className="mb-4 relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-gray-300">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Name</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 hidden md:table-cell">Email</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 hidden lg:table-cell">Role</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 hidden lg:table-cell">Telephone</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredStaff.map((member) => (
                <tr key={member.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="py-3 px-4">{member.name}</td>
                  <td className="py-3 px-4 hidden md:table-cell text-gray-600 text-xs">{member.email}</td>
                  <td className="py-3 px-4 hidden lg:table-cell text-gray-600 text-xs">{member.role}</td>
                  <td className="py-3 px-4 hidden lg:table-cell text-gray-600 text-xs">{member.telephone}</td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => handleDeleteStaff(member.id)}
                      className="text-red-600 hover:text-red-800 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-sm text-gray-600 mt-4">
          Total Staff: <span className="font-bold">{staff.length}</span>
        </p>
      </div>
    </div>
  );
}
