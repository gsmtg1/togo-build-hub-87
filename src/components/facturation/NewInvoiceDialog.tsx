
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus, FileText, Sparkles } from "lucide-react";
import { SimpleInvoiceFormWithVAT } from './SimpleInvoiceFormWithVAT';

interface NewInvoiceDialogProps {
  onInvoiceCreated?: () => void;
}

export const NewInvoiceDialog = ({ onInvoiceCreated }: NewInvoiceDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleInvoiceCreated = () => {
    setIsOpen(false);
    if (onInvoiceCreated) {
      onInvoiceCreated();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-200"
          size="lg"
        >
          <div className="flex items-center gap-2">
            <div className="p-1 bg-primary-foreground/20 rounded">
              <Plus className="h-4 w-4" />
            </div>
            <span className="font-semibold">Nouvelle facture</span>
            <Sparkles className="h-4 w-4 opacity-70" />
          </div>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden p-0 border-0 shadow-2xl">
        <DialogHeader className="p-6 pb-4 bg-gradient-to-r from-primary/10 to-accent/10 border-b">
          <DialogTitle className="flex items-center gap-3 text-2xl font-bold text-foreground">
            <div className="p-2 bg-primary/20 rounded-lg">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <span>Créer une nouvelle facture</span>
          </DialogTitle>
        </DialogHeader>
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <SimpleInvoiceFormWithVAT onInvoiceCreated={handleInvoiceCreated} />
        </div>
      </DialogContent>
    </Dialog>
  );
};
