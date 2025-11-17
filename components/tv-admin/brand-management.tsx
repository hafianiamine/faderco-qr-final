"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Edit, Folder, Tag, Target } from "lucide-react"
import { createTVAdClient, type TVBrandCategory, type TVBrand, type TVSubBrand } from "@/lib/supabase/tv-ad-client"

interface BrandHierarchy {
  category: TVBrandCategory
  brands: (TVBrand & { subBrands: TVSubBrand[] })[]
}

export function BrandManagement() {
  const [loading, setLoading] = useState(true)
  const [brandHierarchy, setBrandHierarchy] = useState<BrandHierarchy[]>([])
  const [showCategoryDialog, setShowCategoryDialog] = useState(false)
  const [showBrandDialog, setShowBrandDialog] = useState(false)
  const [showSubBrandDialog, setShowSubBrandDialog] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [selectedBrand, setSelectedBrand] = useState<string>("")
  const [newCategoryName, setNewCategoryName] = useState("")
  const [newBrandName, setNewBrandName] = useState("")
  const [newSubBrandName, setNewSubBrandName] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    loadBrandHierarchy()
  }, [])

  const loadBrandHierarchy = async () => {
    try {
      const supabase = createTVAdClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      // Get categories
      const { data: categories } = await supabase
        .from("tv_brand_categories")
        .select("*")
        .eq("admin_id", user.id)
        .order("name")

      if (!categories) return

      // Get brands and sub-brands for each category
      const hierarchy: BrandHierarchy[] = []

      for (const category of categories) {
        const { data: brands } = await supabase
          .from("tv_brands")
          .select("*")
          .eq("category_id", category.id)
          .order("name")

        const brandsWithSubBrands = []

        if (brands) {
          for (const brand of brands) {
            const { data: subBrands } = await supabase
              .from("tv_sub_brands")
              .select("*")
              .eq("brand_id", brand.id)
              .order("name")

            brandsWithSubBrands.push({
              ...brand,
              subBrands: subBrands || [],
            })
          }
        }

        hierarchy.push({
          category,
          brands: brandsWithSubBrands,
        })
      }

      setBrandHierarchy(hierarchy)
    } catch (error) {
      console.error("Error loading brand hierarchy:", error)
      toast({
        title: "Error",
        description: "Failed to load brand hierarchy",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const createCategory = async () => {
    if (!newCategoryName.trim()) return

    try {
      const supabase = createTVAdClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const { error } = await supabase.from("tv_brand_categories").insert({
        admin_id: user.id,
        name: newCategoryName.trim(),
      })

      if (error) throw error

      toast({
        title: "Success",
        description: "Category created successfully",
      })

      setNewCategoryName("")
      setShowCategoryDialog(false)
      loadBrandHierarchy()
    } catch (error) {
      console.error("Error creating category:", error)
      toast({
        title: "Error",
        description: "Failed to create category",
        variant: "destructive",
      })
    }
  }

  const createBrand = async () => {
    if (!newBrandName.trim() || !selectedCategory) return

    try {
      const supabase = createTVAdClient()

      const { error } = await supabase.from("tv_brands").insert({
        category_id: selectedCategory,
        name: newBrandName.trim(),
      })

      if (error) throw error

      toast({
        title: "Success",
        description: "Brand created successfully",
      })

      setNewBrandName("")
      setSelectedCategory("")
      setShowBrandDialog(false)
      loadBrandHierarchy()
    } catch (error) {
      console.error("Error creating brand:", error)
      toast({
        title: "Error",
        description: "Failed to create brand",
        variant: "destructive",
      })
    }
  }

  const createSubBrand = async () => {
    if (!newSubBrandName.trim() || !selectedBrand) return

    try {
      const supabase = createTVAdClient()

      const { error } = await supabase.from("tv_sub_brands").insert({
        brand_id: selectedBrand,
        name: newSubBrandName.trim(),
      })

      if (error) throw error

      toast({
        title: "Success",
        description: "Sub-brand created successfully",
      })

      setNewSubBrandName("")
      setSelectedBrand("")
      setShowSubBrandDialog(false)
      loadBrandHierarchy()
    } catch (error) {
      console.error("Error creating sub-brand:", error)
      toast({
        title: "Error",
        description: "Failed to create sub-brand",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Brand Management
        </CardTitle>
        <CardDescription>
          Organize your brands in a hierarchical structure: Category → Brand → Sub-brand
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <Dialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Category
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Category</DialogTitle>
                  <DialogDescription>Categories help organize your brands into families or groups.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="category-name">Category Name</Label>
                    <Input
                      id="category-name"
                      placeholder="e.g., Food & Beverage, Technology"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowCategoryDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={createCategory}>Create Category</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={showBrandDialog} onOpenChange={setShowBrandDialog}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Brand
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Brand</DialogTitle>
                  <DialogDescription>Add a brand under an existing category.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="brand-category">Select Category</Label>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {brandHierarchy.map((item) => (
                          <SelectItem key={item.category.id} value={item.category.id}>
                            {item.category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="brand-name">Brand Name</Label>
                    <Input
                      id="brand-name"
                      placeholder="e.g., Coca Cola, Samsung"
                      value={newBrandName}
                      onChange={(e) => setNewBrandName(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowBrandDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={createBrand}>Create Brand</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={showSubBrandDialog} onOpenChange={setShowSubBrandDialog}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Sub-brand
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Sub-brand</DialogTitle>
                  <DialogDescription>Add a sub-brand under an existing brand.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="subbrand-brand">Select Brand</Label>
                    <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a brand" />
                      </SelectTrigger>
                      <SelectContent>
                        {brandHierarchy.map((category) =>
                          category.brands.map((brand) => (
                            <SelectItem key={brand.id} value={brand.id}>
                              {category.category.name} → {brand.name}
                            </SelectItem>
                          )),
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subbrand-name">Sub-brand Name</Label>
                    <Input
                      id="subbrand-name"
                      placeholder="e.g., Coca Cola Zero, Galaxy Series"
                      value={newSubBrandName}
                      onChange={(e) => setNewSubBrandName(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowSubBrandDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={createSubBrand}>Create Sub-brand</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Brand Hierarchy Display */}
          {brandHierarchy.length === 0 ? (
            <div className="text-center py-12">
              <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No brands yet</h3>
              <p className="text-muted-foreground mb-4">Start by creating a category to organize your brands.</p>
              <Button onClick={() => setShowCategoryDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Category
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {brandHierarchy.map((categoryItem) => (
                <Card key={categoryItem.category.id} className="border-l-4 border-l-primary">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Folder className="h-5 w-5 text-primary" />
                        <CardTitle className="text-lg">{categoryItem.category.name}</CardTitle>
                        <Badge variant="secondary">{categoryItem.brands.length} brands</Badge>
                      </div>
                      <Button size="sm" variant="ghost">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {categoryItem.brands.length === 0 ? (
                      <p className="text-muted-foreground text-sm">No brands in this category yet.</p>
                    ) : (
                      <div className="space-y-3">
                        {categoryItem.brands.map((brand) => (
                          <div key={brand.id} className="ml-4 border-l-2 border-l-muted pl-4">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <Tag className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">{brand.name}</span>
                                {brand.subBrands.length > 0 && (
                                  <Badge variant="outline" className="text-xs">
                                    {brand.subBrands.length} sub-brands
                                  </Badge>
                                )}
                              </div>
                              <Button size="sm" variant="ghost">
                                <Edit className="h-3 w-3" />
                              </Button>
                            </div>
                            {brand.subBrands.length > 0 && (
                              <div className="ml-6 space-y-1">
                                {brand.subBrands.map((subBrand) => (
                                  <div key={subBrand.id} className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">• {subBrand.name}</span>
                                    <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                                      <Edit className="h-3 w-3" />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
