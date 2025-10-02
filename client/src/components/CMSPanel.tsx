import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Alert, AlertDescription } from './ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  FileText, 
  HelpCircle, 
  Star, 
  Save, 
  Loader2, 
  Plus, 
  Edit, 
  Trash2,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  Globe
} from 'lucide-react';

interface ContentPage {
  id: string;
  pageKey: string;
  title: string;
  metaDescription?: string;
  metaKeywords?: string;
  content: string;
  isPublished: boolean;
  seoTitle?: string;
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  lastEditedBy?: string;
  version: number;
  createdAt: string;
  updatedAt: string;
}

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  isPublished: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

interface Testimonial {
  id: string;
  name: string;
  email?: string;
  content: string;
  rating: number;
  isApproved: boolean;
  isPublished: boolean;
  avatar?: string;
  company?: string;
  position?: string;
  createdAt: string;
  updatedAt: string;
}

interface SaveResult {
  success: boolean;
  message: string;
}

export default function CMSPanel() {
  const [activeTab, setActiveTab] = useState('pages');
  const [saveResult, setSaveResult] = useState<SaveResult | null>(null);
  const [editingPage, setEditingPage] = useState<ContentPage | null>(null);
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);

  const queryClient = useQueryClient();

  // Content Pages
  const { data: contentPages, isLoading: pagesLoading } = useQuery<ContentPage[]>({
    queryKey: ['contentPages'],
    queryFn: async () => {
      const response = await fetch('/api/admin/cms/pages', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch content pages');
      return response.json();
    }
  });

  // FAQs
  const { data: faqs, isLoading: faqsLoading } = useQuery<FAQ[]>({
    queryKey: ['faqs'],
    queryFn: async () => {
      const response = await fetch('/api/cms/faqs', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch FAQs');
      return response.json();
    }
  });

  // Testimonials
  const { data: testimonials, isLoading: testimonialsLoading } = useQuery<Testimonial[]>({
    queryKey: ['testimonials'],
    queryFn: async () => {
      const response = await fetch('/api/admin/cms/testimonials', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch testimonials');
      return response.json();
    }
  });

  // Mutations
  const updatePageMutation = useMutation({
    mutationFn: async (page: Partial<ContentPage>) => {
      const response = await fetch(`/api/admin/cms/pages/${page.pageKey}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(page)
      });
      if (!response.ok) throw new Error('Failed to update page');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contentPages'] });
      setSaveResult({ success: true, message: 'Page updated successfully!' });
      setEditingPage(null);
      setTimeout(() => setSaveResult(null), 5000);
    },
    onError: (error) => {
      setSaveResult({ success: false, message: `Failed to update: ${error.message}` });
      setTimeout(() => setSaveResult(null), 5000);
    }
  });

  const createFaqMutation = useMutation({
    mutationFn: async (faq: Omit<FAQ, 'id' | 'createdAt' | 'updatedAt'>) => {
      const response = await fetch('/api/admin/cms/faqs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(faq)
      });
      if (!response.ok) throw new Error('Failed to create FAQ');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['faqs'] });
      setSaveResult({ success: true, message: 'FAQ created successfully!' });
      setEditingFaq(null);
      setTimeout(() => setSaveResult(null), 5000);
    }
  });

  const updateFaqMutation = useMutation({
    mutationFn: async ({ id, ...faq }: Partial<FAQ> & { id: string }) => {
      const response = await fetch(`/api/admin/cms/faqs/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(faq)
      });
      if (!response.ok) throw new Error('Failed to update FAQ');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['faqs'] });
      setSaveResult({ success: true, message: 'FAQ updated successfully!' });
      setEditingFaq(null);
      setTimeout(() => setSaveResult(null), 5000);
    }
  });

  const deleteFaqMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/admin/cms/faqs/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to delete FAQ');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['faqs'] });
      setSaveResult({ success: true, message: 'FAQ deleted successfully!' });
      setTimeout(() => setSaveResult(null), 5000);
    }
  });

  const updateTestimonialMutation = useMutation({
    mutationFn: async ({ id, ...testimonial }: Partial<Testimonial> & { id: string }) => {
      const response = await fetch(`/api/admin/cms/testimonials/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(testimonial)
      });
      if (!response.ok) throw new Error('Failed to update testimonial');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['testimonials'] });
      setSaveResult({ success: true, message: 'Testimonial updated successfully!' });
      setTimeout(() => setSaveResult(null), 5000);
    }
  });

  const deleteTestimonialMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/admin/cms/testimonials/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to delete testimonial');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['testimonials'] });
      setSaveResult({ success: true, message: 'Testimonial deleted successfully!' });
      setTimeout(() => setSaveResult(null), 5000);
    }
  });

  const parsePageContent = (content: string) => {
    try {
      return JSON.parse(content);
    } catch {
      return {};
    }
  };

  if (pagesLoading || faqsLoading || testimonialsLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Content Management</h1>
        <p className="text-muted-foreground">
          Manage website content, FAQs, and testimonials
        </p>
      </div>

      {/* Save Result */}
      {saveResult && (
        <Alert variant={saveResult.success ? "default" : "destructive"}>
          <div className="flex items-center gap-2">
            {saveResult.success ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <XCircle className="h-4 w-4" />
            )}
            <AlertDescription>{saveResult.message}</AlertDescription>
          </div>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pages">
            <FileText className="h-4 w-4 mr-2" />
            Pages
          </TabsTrigger>
          <TabsTrigger value="faqs">
            <HelpCircle className="h-4 w-4 mr-2" />
            FAQs
          </TabsTrigger>
          <TabsTrigger value="testimonials">
            <Star className="h-4 w-4 mr-2" />
            Testimonials
          </TabsTrigger>
        </TabsList>

        {/* Content Pages Tab */}
        <TabsContent value="pages" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Website Pages</h2>
            {/* Could add "New Page" button here in future */}
          </div>

          <div className="grid gap-4">
            {contentPages?.map((page) => (
              <Card key={page.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {page.isPublished ? (
                          <Globe className="h-4 w-4 text-green-600" />
                        ) : (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        )}
                        {page.title}
                      </CardTitle>
                      <CardDescription>
                        Page key: {page.pageKey} • Last edited: {new Date(page.updatedAt).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => setEditingPage(page)}
                      className="flex items-center gap-2"
                    >
                      <Edit className="h-4 w-4" />
                      Edit
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {page.metaDescription || 'No description available'}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Edit Page Modal */}
          {editingPage && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Edit Page: {editingPage.title}</CardTitle>
                <CardDescription>
                  Modify page content and SEO settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={editingPage.title}
                      onChange={(e) => setEditingPage({ ...editingPage, title: e.target.value })}
                      placeholder="Page title"
                    />
                  </div>
                  <div className="flex items-center space-x-2 mt-6">
                    <Switch
                      id="published"
                      checked={editingPage.isPublished}
                      onCheckedChange={(checked) => setEditingPage({ ...editingPage, isPublished: checked })}
                    />
                    <Label htmlFor="published">Published</Label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="meta-description">Meta Description</Label>
                  <Textarea
                    id="meta-description"
                    value={editingPage.metaDescription || ''}
                    onChange={(e) => setEditingPage({ ...editingPage, metaDescription: e.target.value })}
                    placeholder="SEO meta description..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">Page Content (JSON)</Label>
                  <Textarea
                    id="content"
                    value={editingPage.content || '{}'}
                    onChange={(e) => setEditingPage({ ...editingPage, content: e.target.value })}
                    placeholder="Page content in JSON format..."
                    rows={10}
                    className="font-mono text-sm"
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => updatePageMutation.mutate(editingPage)}
                    disabled={updatePageMutation.isPending}
                    className="flex items-center gap-2"
                  >
                    {updatePageMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    Save Changes
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setEditingPage(null)}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* FAQs Tab */}
        <TabsContent value="faqs" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Frequently Asked Questions</h2>
            <Button
              onClick={() => setEditingFaq({
                id: '',
                question: '',
                answer: '',
                category: 'general',
                isPublished: true,
                sortOrder: 0,
                createdAt: '',
                updatedAt: ''
              })}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add FAQ
            </Button>
          </div>

          <div className="grid gap-4">
            {faqs?.map((faq) => (
              <Card key={faq.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        {faq.isPublished ? (
                          <Eye className="h-4 w-4 text-green-600" />
                        ) : (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        )}
                        {faq.question}
                      </CardTitle>
                      <CardDescription>
                        Category: {faq.category} • Order: {faq.sortOrder}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingFaq(faq)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteFaqMutation.mutate(faq.id)}
                        disabled={deleteFaqMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm line-clamp-2">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Edit FAQ Modal */}
          {editingFaq && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>
                  {editingFaq.id ? 'Edit FAQ' : 'Create New FAQ'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="faq-question">Question</Label>
                  <Input
                    id="faq-question"
                    value={editingFaq.question}
                    onChange={(e) => setEditingFaq({ ...editingFaq, question: e.target.value })}
                    placeholder="Enter the question..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="faq-answer">Answer</Label>
                  <Textarea
                    id="faq-answer"
                    value={editingFaq.answer}
                    onChange={(e) => setEditingFaq({ ...editingFaq, answer: e.target.value })}
                    placeholder="Enter the answer..."
                    rows={5}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="faq-category">Category</Label>
                    <Select 
                      value={editingFaq.category} 
                      onValueChange={(value) => setEditingFaq({ ...editingFaq, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General</SelectItem>
                        <SelectItem value="pricing">Pricing</SelectItem>
                        <SelectItem value="technical">Technical</SelectItem>
                        <SelectItem value="support">Support</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="faq-order">Sort Order</Label>
                    <Input
                      id="faq-order"
                      type="number"
                      value={editingFaq.sortOrder}
                      onChange={(e) => setEditingFaq({ ...editingFaq, sortOrder: parseInt(e.target.value) || 0 })}
                    />
                  </div>

                  <div className="flex items-center space-x-2 mt-6">
                    <Switch
                      id="faq-published"
                      checked={editingFaq.isPublished}
                      onCheckedChange={(checked) => setEditingFaq({ ...editingFaq, isPublished: checked })}
                    />
                    <Label htmlFor="faq-published">Published</Label>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      if (editingFaq.id) {
                        updateFaqMutation.mutate(editingFaq);
                      } else {
                        createFaqMutation.mutate(editingFaq);
                      }
                    }}
                    disabled={createFaqMutation.isPending || updateFaqMutation.isPending}
                    className="flex items-center gap-2"
                  >
                    {(createFaqMutation.isPending || updateFaqMutation.isPending) ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    {editingFaq.id ? 'Update FAQ' : 'Create FAQ'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setEditingFaq(null)}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Testimonials Tab */}
        <TabsContent value="testimonials" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Customer Testimonials</h2>
            <p className="text-sm text-muted-foreground">
              Manage testimonial approvals and visibility
            </p>
          </div>

          <div className="grid gap-4">
            {testimonials?.map((testimonial) => (
              <Card key={testimonial.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${i < testimonial.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`}
                            />
                          ))}
                        </div>
                        {testimonial.name}
                        {testimonial.company && (
                          <span className="text-sm text-muted-foreground">
                            • {testimonial.company}
                          </span>
                        )}
                      </CardTitle>
                      <CardDescription>
                        <div className="flex items-center gap-4">
                          <span>
                            Status: 
                            {testimonial.isApproved ? (
                              <span className="text-green-600 ml-1">Approved</span>
                            ) : (
                              <span className="text-orange-600 ml-1">Pending</span>
                            )}
                          </span>
                          <span>
                            Visibility: 
                            {testimonial.isPublished ? (
                              <span className="text-green-600 ml-1">Published</span>
                            ) : (
                              <span className="text-gray-600 ml-1">Hidden</span>
                            )}
                          </span>
                        </div>
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateTestimonialMutation.mutate({
                          id: testimonial.id,
                          isApproved: !testimonial.isApproved
                        })}
                      >
                        {testimonial.isApproved ? 'Unapprove' : 'Approve'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateTestimonialMutation.mutate({
                          id: testimonial.id,
                          isPublished: !testimonial.isPublished
                        })}
                      >
                        {testimonial.isPublished ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteTestimonialMutation.mutate(testimonial.id)}
                        disabled={deleteTestimonialMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm line-clamp-3">{testimonial.content}</p>
                  {testimonial.email && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Email: {testimonial.email}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}