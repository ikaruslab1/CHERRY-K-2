

interface ContentPlaceholderProps {
  type?: 'card' | 'table' | 'grid';
  count?: number;
}

export function ContentPlaceholder({ type = 'card', count = 1 }: ContentPlaceholderProps) {
  if (type === 'table') {
    return (
      <div className="w-full space-y-4 animate-in fade-in duration-500">
        <div className="flex items-center justify-between mb-6">
          <div className="h-8 w-48 bg-gray-200 rounded-lg animate-pulse" />
          <div className="h-8 w-32 bg-gray-200 rounded-lg animate-pulse" />
        </div>
        <div className="border border-gray-100 rounded-xl overflow-hidden bg-white shadow-sm">
          <div className="h-12 bg-gray-50 border-b border-gray-100 flex items-center px-4 gap-4">
             {[1, 2, 3, 4].map((i) => (
               <div key={i} className="h-4 bg-gray-200 rounded w-1/4 animate-pulse" />
             ))}
          </div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 border-b border-gray-50 flex items-center px-4 gap-4">
               <div className="h-10 w-10 rounded-full bg-gray-100 animate-pulse" />
               <div className="space-y-2 flex-1">
                 <div className="h-3 w-1/3 bg-gray-100 rounded animate-pulse" />
                 <div className="h-2 w-1/4 bg-gray-50 rounded animate-pulse" />
               </div>
               <div className="h-6 w-20 bg-gray-100 rounded-full animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (type === 'grid') { // For Agenda/Events
    return (
      <div className="w-full space-y-6 animate-in fade-in duration-500">
        <div className="h-8 w-48 bg-gray-200 rounded-lg animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(count || 4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm h-48 space-y-4">
              <div className="flex justify-between">
                <div className="h-6 w-20 bg-gray-100 rounded-full animate-pulse" />
                <div className="h-6 w-6 bg-gray-100 rounded-full animate-pulse" />
              </div>
              <div className="space-y-2">
                <div className="h-6 w-3/4 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-1/2 bg-gray-100 rounded animate-pulse" />
              </div>
              <div className="pt-4 flex justify-between items-end">
                 <div className="h-4 w-24 bg-gray-100 rounded animate-pulse" />
                 <div className="h-8 w-24 bg-gray-200 rounded-lg animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Default 'card' (Profile view)
  return (
    <div className="w-full max-w-md mx-auto animate-in fade-in duration-500 py-8">
       <div className="bg-white rounded-3xl overflow-hidden shadow-lg border border-gray-100">
          <div className="h-32 bg-gray-200 animate-pulse" />
          <div className="px-8 pb-8 -mt-12 relative">
             <div className="flex justify-center mb-6">
                <div className="h-24 w-24 rounded-full bg-gray-100 border-4 border-white animate-pulse" />
             </div>
             <div className="space-y-4 text-center">
                <div className="h-8 w-3/4 mx-auto bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-1/2 mx-auto bg-gray-100 rounded animate-pulse" />
                
                <div className="pt-6 grid grid-cols-2 gap-4">
                    <div className="h-20 bg-gray-50 rounded-2xl animate-pulse" />
                    <div className="h-20 bg-gray-50 rounded-2xl animate-pulse" />
                </div>
             </div>
          </div>
       </div>
    </div>
  );
}
