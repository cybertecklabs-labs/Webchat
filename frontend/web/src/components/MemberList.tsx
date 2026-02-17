"use client";

export function MemberList() {
    // Mock data for now
    const onlineMembers = ["User1", "User2", "User3"];
    const offlineMembers = ["User4", "User5"];

    return (
        <div className="w-60 bg-gray-800 border-l border-gray-900 p-4">
            <div className="mb-4">
                <div className="text-xs font-semibold text-gray-400 uppercase mb-2">
                    Online — {onlineMembers.length}
                </div>
                <div className="space-y-2">
                    {onlineMembers.map((member) => (
                        <div key={member} className="flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-700/50 cursor-pointer">
                            <div className="relative">
                                <div className="w-8 h-8 rounded-full bg-gaming-green flex items-center justify-center text-gray-900 font-semibold text-sm">
                                    {member[0]}
                                </div>
                                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-800" />
                            </div>
                            <span className="text-sm text-gray-200">{member}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div>
                <div className="text-xs font-semibold text-gray-400 uppercase mb-2">
                    Offline — {offlineMembers.length}
                </div>
                <div className="space-y-2">
                    {offlineMembers.map((member) => (
                        <div key={member} className="flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-700/50 cursor-pointer">
                            <div className="relative">
                                <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-gray-300 font-semibold text-sm">
                                    {member[0]}
                                </div>
                                <div className="absolute bottom-0 right-0 w-3 h-3 bg-gray-500 rounded-full border-2 border-gray-800" />
                            </div>
                            <span className="text-sm text-gray-400">{member}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
