"use client";

import { X, Trash2, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface DeleteConfirmModalProps {
    isOpen: boolean;
    itemName: string;
    onClose: () => void;
    onConfirm: () => void;
    isDeleting?: boolean;
}

export default function DeleteConfirmModal({ 
    isOpen, 
    itemName, 
    onClose, 
    onConfirm,
    isDeleting 
}: DeleteConfirmModalProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
                        onClick={!isDeleting ? onClose : undefined}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-x-4 top-1/2 -translate-y-1/2 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-sm bg-white rounded-3xl shadow-2xl z-50 overflow-hidden"
                    >
                        {/* Header */}
                        <div className="p-6 pb-4 bg-gradient-to-br from-red-50 to-rose-50 border-b border-red-100">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                                        <AlertTriangle className="w-5 h-5 text-red-600" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-800">
                                        Hapus Konten?
                                    </h3>
                                </div>
                                {!isDeleting && (
                                    <button
                                        onClick={onClose}
                                        className="p-2 hover:bg-white/80 rounded-full transition-colors text-gray-400 hover:text-gray-600"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6">
                            <p className="text-gray-600 text-center mb-6">
                                Konten <span className="font-semibold text-gray-800">"{itemName}"</span> akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.
                            </p>

                            <div className="flex gap-3">
                                <button
                                    onClick={onClose}
                                    disabled={isDeleting}
                                    className="flex-1 py-3 px-4 rounded-xl border-2 border-gray-200 text-gray-600 font-medium hover:bg-gray-100 transition-colors disabled:opacity-50"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={onConfirm}
                                    disabled={isDeleting}
                                    className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-red-500 to-rose-500 text-white font-bold hover:from-red-600 hover:to-rose-600 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                                >
                                    {isDeleting ? (
                                        "Menghapus..."
                                    ) : (
                                        <>
                                            <Trash2 className="w-4 h-4" />
                                            Hapus
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
