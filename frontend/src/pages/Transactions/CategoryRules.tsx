import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { fetchCategoryRules, createCategoryRule, updateCategoryRule, deleteCategoryRule } from '@/api/category-rule.api';
import { fetchCategories } from '@/api/transaction.api';
import { CategoryRule, MatchType, MatchField } from '@/types/transaction/category-rule.type';
import { TransactionCategory } from '@/types/transaction/transaction.type';
import { useToast } from '@/components/ui/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

// Form schema
const categoryRuleSchema = z.object({
  categoryId: z.string().min(1, "Category is required"),
  field: z.enum([MatchField.DESCRIPTION, MatchField.MERCHANT]),
  pattern: z.string().min(1, "Pattern is required"),
  matchType: z.enum([MatchType.EXACT, MatchType.CONTAINS, MatchType.REGEX]),
  isActive: z.boolean().default(true),
  priority: z.number().int().min(0).default(0)
});

type FormData = z.infer<typeof categoryRuleSchema>;

const CategoryRules: React.FC = () => {
  const [rules, setRules] = useState<CategoryRule[]>([]);
  const [categories, setCategories] = useState<TransactionCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<CategoryRule | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const form = useForm<FormData>({
    resolver: zodResolver(categoryRuleSchema),
    defaultValues: {
      categoryId: '',
      field: MatchField.DESCRIPTION,
      pattern: '',
      matchType: MatchType.CONTAINS,
      isActive: true,
      priority: 0
    }
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (editingRule) {
      form.reset({
        categoryId: editingRule.categoryId,
        field: editingRule.field,
        pattern: editingRule.pattern,
        matchType: editingRule.matchType,
        isActive: editingRule.isActive,
        priority: editingRule.priority
      });
    } else {
      form.reset({
        categoryId: '',
        field: MatchField.DESCRIPTION,
        pattern: '',
        matchType: MatchType.CONTAINS,
        isActive: true,
        priority: 0
      });
    }
  }, [editingRule, form]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [rulesData, categoriesData] = await Promise.all([
        fetchCategoryRules(),
        fetchCategories()
      ]);
      setRules(rulesData);
      setCategories(categoriesData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: FormData) => {
    try {
      if (editingRule) {
        await updateCategoryRule(editingRule.id, data);
        toast({
          title: "Success",
          description: "Category rule updated successfully",
        });
      } else {
        await createCategoryRule(data);
        toast({
          title: "Success",
          description: "Category rule created successfully",
        });
      }
      setIsDialogOpen(false);
      loadData();
    } catch (error) {
      toast({
        title: "Error",
        description: editingRule ? "Failed to update rule" : "Failed to create rule",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteCategoryRule(id);
      toast({
        title: "Success",
        description: "Category rule deleted successfully",
      });
      loadData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete rule",
        variant: "destructive",
      });
    }
  };

  const handleToggleActive = async (rule: CategoryRule) => {
    try {
      await updateCategoryRule(rule.id, { isActive: !rule.isActive });
      loadData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update rule status",
        variant: "destructive",
      });
    }
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : 'Unknown';
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Category Rules</h1>
        <Button onClick={() => {
          setEditingRule(null);
          setIsDialogOpen(true);
        }}>Add Rule</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Automatic Categorization Rules</CardTitle>
          <CardDescription>
            Rules are applied in order of priority (highest first) to automatically categorize transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <p>Loading rules...</p>
            </div>
          ) : rules.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium">No rules found</h3>
              <p className="text-muted-foreground mt-2">Create rules to automatically categorize transactions</p>
              <Button className="mt-4" onClick={() => {
                setEditingRule(null);
                setIsDialogOpen(true);
              }}>Create Rule</Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Active</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Field</TableHead>
                  <TableHead>Match Type</TableHead>
                  <TableHead>Pattern</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rules.map((rule) => (
                  <TableRow key={rule.id}>
                    <TableCell>
                      <Switch
                        checked={rule.isActive}
                        onCheckedChange={() => handleToggleActive(rule)}
                      />
                    </TableCell>
                    <TableCell>{rule.priority}</TableCell>
                    <TableCell>{getCategoryName(rule.categoryId)}</TableCell>
                    <TableCell className="capitalize">{rule.field}</TableCell>
                    <TableCell className="capitalize">{rule.matchType}</TableCell>
                    <TableCell className="max-w-xs truncate">{rule.pattern}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingRule(rule);
                            setIsDialogOpen(true);
                          }}
                        >
                          Edit
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">Delete</Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the rule.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(rule.id)}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingRule ? 'Edit Rule' : 'Create Rule'}</DialogTitle>
            <DialogDescription>
              {editingRule 
                ? 'Update the rule for automatic transaction categorization' 
                : 'Create a new rule for automatic transaction categorization'}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      The category to assign when this rule matches
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="field"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Field</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a field" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={MatchField.DESCRIPTION}>Description</SelectItem>
                        <SelectItem value={MatchField.MERCHANT}>Merchant</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      The transaction field to match against
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="matchType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Match Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a match type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={MatchType.EXACT}>Exact</SelectItem>
                        <SelectItem value={MatchType.CONTAINS}>Contains</SelectItem>
                        <SelectItem value={MatchType.REGEX}>Regex</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      How to match the pattern against the field
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="pattern"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pattern</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., grocery" {...field} />
                    </FormControl>
                    <FormDescription>
                      {form.watch('matchType') === MatchType.EXACT 
                        ? 'The exact text to match' 
                        : form.watch('matchType') === MatchType.CONTAINS
                          ? 'Text that must be contained in the field'
                          : 'Regular expression pattern'}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="0" 
                        {...field} 
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription>
                      Higher priority rules are applied first (0 is lowest)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Active</FormLabel>
                      <FormDescription>
                        Whether this rule should be applied
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit">
                  {editingRule ? 'Update' : 'Create'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CategoryRules;
