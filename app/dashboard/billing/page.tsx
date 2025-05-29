"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Receipt, Clock, AlertCircle } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useFirebase } from "@/lib/firebase/firebase-provider";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface Transaction {
  id: string;
  amount: number;
  status: string;
  createdAt: Date;
  description: string;
  paymentMethod?: string;
  receiptUrl?: string;
}

export default function BillingPage() {
  const { user } = useFirebase();
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(true);

  useEffect(() => {
    const loadTransactions = async () => {
      if (user) {
        try {
          const response = await fetch(`/api/payments/transactions?userId=${user.uid}`);
          const data = await response.json();

          if (data.transactions) {
            setTransactions(
              data.transactions.map((tx: any) => ({
                ...tx,
                createdAt: new Date(tx.createdAt),
              }))
            );
          }
        } catch (error) {
          console.error("Error loading transactions:", error);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to load payment history",
          });
        } finally {
          setIsLoadingTransactions(false);
        }
      }
    };

    loadTransactions();
  }, [user, toast]);

  if (isLoadingTransactions) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 bg-muted rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">Histórico de Pagamentos</h1>
          <p className="text-muted-foreground mt-2">Visualize todas as suas transações e recibos</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Transações
            </CardTitle>
            <CardDescription>Histórico de pagamentos de publicação de páginas</CardDescription>
          </CardHeader>
          <CardContent>
            {transactions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma transação encontrada</p>
                <p className="text-sm">Seu histórico de pagamentos aparecerá aqui</p>
              </div>
            ) : (
              <div className="relative overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Recibo</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell className="font-medium">{transaction.createdAt.toLocaleDateString()}</TableCell>
                        <TableCell>{transaction.description}</TableCell>
                        <TableCell>R$ {transaction.amount.toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge
                            variant={transaction.status === "succeeded" ? "default" : transaction.status === "pending" ? "secondary" : "destructive"}
                          >
                            {transaction.status === "succeeded" ? "Aprovado" : transaction.status === "pending" ? "Pendente" : "Falhou"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {transaction.receiptUrl && (
                            <Button variant="ghost" size="sm" asChild className="hover:text-primary">
                              <a href={transaction.receiptUrl} target="_blank" rel="noopener noreferrer">
                                <Receipt className="h-4 w-4" />
                              </a>
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="text-center text-sm text-muted-foreground">
          <p>Precisa de ajuda com seus pagamentos? Entre em contato com nosso suporte.</p>
          <Button variant="outline" className="mt-2">
            Contatar Suporte
          </Button>
        </div>
      </div>
    </div>
  );
}
