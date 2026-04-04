import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { apiClient } from "@/api/client";
import { Loader2 } from "lucide-react";

const CATEGORIES = ["food", "beverage", "clothing", "medicine", "equipment", "accessories", "other"];
const UNITS = ["pcs", "kg", "g", "litre", "ml", "box", "pack", "dozen"];

const defaults = {
  name: "", category: "other", description: "", price: 0, cost_price: 0,
  stock: 0, low_stock_alert: 5, unit: "pcs", sku: "", status: "active", image_url: "",
};

export default function ProductFormDialog({ open, onOpenChange, product, onSaved }) {
  const isEdit = !!product;
  const [form, setForm] = useState(product || defaults);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await apiClient.integrations.Core.UploadFile({ file });
    set("image_url", file_url);
    setUploading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    if (isEdit) {
      await apiClient.entities.Product.update(product.id, form);
    } else {
      await apiClient.entities.Product.create(form);
    }
    setSaving(false);
    onSaved();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Product" : "Add Product"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label>Name</Label>
              <Input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Product name" />
            </div>
            <div>
              <Label>Category</Label>
              <Select value={form.category} onValueChange={(v) => set("category", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>SKU</Label>
              <Input value={form.sku} onChange={(e) => set("sku", e.target.value)} placeholder="SKU-001" />
            </div>
            <div className="col-span-2">
              <Label>Description</Label>
              <Textarea value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Optional description" />
            </div>
          </div>

          <div className="pt-2 border-t">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Pricing</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Selling Price (৳)</Label>
                <Input type="number" value={form.price} onChange={(e) => set("price", Number(e.target.value))} />
              </div>
              <div>
                <Label className="text-xs">Cost Price (৳)</Label>
                <Input type="number" value={form.cost_price} onChange={(e) => set("cost_price", Number(e.target.value))} />
              </div>
            </div>
          </div>

          <div className="pt-2 border-t">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Inventory</h4>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label className="text-xs">Stock</Label>
                <Input type="number" value={form.stock} onChange={(e) => set("stock", Number(e.target.value))} />
              </div>
              <div>
                <Label className="text-xs">Low Stock Alert</Label>
                <Input type="number" value={form.low_stock_alert} onChange={(e) => set("low_stock_alert", Number(e.target.value))} />
              </div>
              <div>
                <Label className="text-xs">Unit</Label>
                <Select value={form.unit} onValueChange={(v) => set("unit", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {UNITS.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => set("status", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Image</Label>
              <Input type="file" accept="image/*" onChange={handleImageUpload} />
              {uploading && <p className="text-xs text-gray-400 mt-1">Uploading...</p>}
            </div>
          </div>
          {form.image_url && (
            <img src={form.image_url} className="h-20 rounded-lg object-cover" />
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving || !form.name} className="bg-violet-600 hover:bg-violet-700">
            {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {isEdit ? "Update" : "Add Product"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
