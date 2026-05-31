import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Github, Linkedin, Twitter, Award, Edit2, X } from 'lucide-react'
import api from '../lib/axios'
import toast from 'react-hot-toast'

const Brand = () => {
  const queryClient = useQueryClient()
  const [showModal, setShowModal] = useState(false)
  const [editingPlatform, setEditingPlatform] = useState(null)
  const [formData, setFormData] = useState({})

  const { data: brand } = useQuery({
    queryKey: ['brand'],
    queryFn: async () => {
      const { data } = await api.get('/brand')
      return data.data
    }
  })

  const updateMutation = useMutation({
    mutationFn: (data) => api.put('/brand', data),
    onSuccess: () => {
      queryClient.invalidateQueries(['brand'])
      toast.success('Profile updated!')
      setShowModal(false)
      setEditingPlatform(null)
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update')
    }
  })

  const handleEdit = (platform) => {
    setEditingPlatform(platform)
    if (platform === 'github') {
      setFormData({
        username: brand?.github?.username || '',
        profileUrl: brand?.github?.profileUrl || '',
        totalRepos: brand?.github?.totalRepos || 0,
        totalStars: brand?.github?.totalStars || 0,
        totalCommits: brand?.github?.totalCommits || 0
      })
    } else if (platform === 'linkedin') {
      setFormData({
        profileUrl: brand?.linkedin?.profileUrl || ''
      })
    } else if (platform === 'twitter') {
      setFormData({
        handle: brand?.twitter?.handle || '',
        profileUrl: brand?.twitter?.profileUrl || ''
      })
    } else if (platform === 'kaggle') {
      setFormData({
        username: brand?.kaggle?.username || '',
        profileUrl: brand?.kaggle?.profileUrl || '',
        tier: brand?.kaggle?.tier || '',
        competitions: brand?.kaggle?.competitions || 0,
        datasets: brand?.kaggle?.datasets || 0,
        notebooks: brand?.kaggle?.notebooks || 0
      })
    }
    setShowModal(true)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const updateData = {
      [editingPlatform]: {
        ...formData,
        lastUpdated: new Date()
      }
    }
    updateMutation.mutate(updateData)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Personal Brand</h1>
        <p className="text-gray-400">Track your online presence and contributions</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* GitHub */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gray-500/20 rounded-lg">
                <Github size={24} />
              </div>
              <div>
                <h3 className="font-semibold">GitHub</h3>
                <p className="text-sm text-gray-400">{brand?.github?.username || 'Not connected'}</p>
              </div>
            </div>
            <button
              onClick={() => handleEdit('github')}
              className="p-2 hover:bg-dark-hover rounded-lg transition-colors"
            >
              <Edit2 size={18} className="text-primary" />
            </button>
          </div>
          {brand?.github?.username && (
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-2xl font-bold">{brand.github.totalRepos || 0}</p>
                <p className="text-xs text-gray-400">Repositories</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{brand.github.totalStars || 0}</p>
                <p className="text-xs text-gray-400">Stars</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{brand.github.totalCommits || 0}</p>
                <p className="text-xs text-gray-400">Commits</p>
              </div>
            </div>
          )}
        </motion.div>

        {/* LinkedIn */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-500/20 rounded-lg">
                <Linkedin size={24} className="text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold">LinkedIn</h3>
                <p className="text-sm text-gray-400">
                  {brand?.linkedin?.profileUrl ? 'Connected' : 'Not connected'}
                </p>
              </div>
            </div>
            <button
              onClick={() => handleEdit('linkedin')}
              className="p-2 hover:bg-dark-hover rounded-lg transition-colors"
            >
              <Edit2 size={18} className="text-primary" />
            </button>
          </div>
          {brand?.linkedin?.posts && brand.linkedin.posts.length > 0 && (
            <div>
              <p className="text-2xl font-bold">{brand.linkedin.posts.length}</p>
              <p className="text-xs text-gray-400">Posts</p>
            </div>
          )}
        </motion.div>

        {/* Twitter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-cyan-500/20 rounded-lg">
                <Twitter size={24} className="text-cyan-400" />
              </div>
              <div>
                <h3 className="font-semibold">Twitter/X</h3>
                <p className="text-sm text-gray-400">{brand?.twitter?.handle || 'Not connected'}</p>
              </div>
            </div>
            <button
              onClick={() => handleEdit('twitter')}
              className="p-2 hover:bg-dark-hover rounded-lg transition-colors"
            >
              <Edit2 size={18} className="text-primary" />
            </button>
          </div>
          {brand?.twitter?.tweets && brand.twitter.tweets.length > 0 && (
            <div>
              <p className="text-2xl font-bold">{brand.twitter.tweets.length}</p>
              <p className="text-xs text-gray-400">Tweets</p>
            </div>
          )}
        </motion.div>

        {/* Kaggle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-cyan-500/20 rounded-lg">
                <Award size={24} className="text-cyan-400" />
              </div>
              <div>
                <h3 className="font-semibold">Kaggle</h3>
                <p className="text-sm text-gray-400">{brand?.kaggle?.username || 'Not connected'}</p>
              </div>
            </div>
            <button
              onClick={() => handleEdit('kaggle')}
              className="p-2 hover:bg-dark-hover rounded-lg transition-colors"
            >
              <Edit2 size={18} className="text-primary" />
            </button>
          </div>
          {brand?.kaggle?.username && (
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-2xl font-bold">{brand.kaggle.competitions || 0}</p>
                <p className="text-xs text-gray-400">Competitions</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{brand.kaggle.datasets || 0}</p>
                <p className="text-xs text-gray-400">Datasets</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{brand.kaggle.notebooks || 0}</p>
                <p className="text-xs text-gray-400">Notebooks</p>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {showModal && editingPlatform && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass rounded-xl p-6 w-full max-w-lg"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold capitalize">Update {editingPlatform}</h2>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-dark-hover rounded-lg">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {editingPlatform === 'github' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-2">Username</label>
                      <input
                        type="text"
                        value={formData.username || ''}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 focus:outline-none focus:border-primary"
                        placeholder="yourusername"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Profile URL</label>
                      <input
                        type="url"
                        value={formData.profileUrl || ''}
                        onChange={(e) => setFormData({ ...formData, profileUrl: e.target.value })}
                        className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 focus:outline-none focus:border-primary"
                        placeholder="https://github.com/yourusername"
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Repos</label>
                        <input
                          type="number"
                          value={formData.totalRepos || 0}
                          onChange={(e) => setFormData({ ...formData, totalRepos: parseInt(e.target.value) })}
                          className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 focus:outline-none focus:border-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Stars</label>
                        <input
                          type="number"
                          value={formData.totalStars || 0}
                          onChange={(e) => setFormData({ ...formData, totalStars: parseInt(e.target.value) })}
                          className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 focus:outline-none focus:border-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Commits</label>
                        <input
                          type="number"
                          value={formData.totalCommits || 0}
                          onChange={(e) => setFormData({ ...formData, totalCommits: parseInt(e.target.value) })}
                          className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 focus:outline-none focus:border-primary"
                        />
                      </div>
                    </div>
                  </>
                )}

                {editingPlatform === 'linkedin' && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Profile URL</label>
                    <input
                      type="url"
                      value={formData.profileUrl || ''}
                      onChange={(e) => setFormData({ ...formData, profileUrl: e.target.value })}
                      className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 focus:outline-none focus:border-primary"
                      placeholder="https://linkedin.com/in/yourprofile"
                    />
                  </div>
                )}

                {editingPlatform === 'twitter' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-2">Handle</label>
                      <input
                        type="text"
                        value={formData.handle || ''}
                        onChange={(e) => setFormData({ ...formData, handle: e.target.value })}
                        className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 focus:outline-none focus:border-primary"
                        placeholder="@yourhandle"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Profile URL</label>
                      <input
                        type="url"
                        value={formData.profileUrl || ''}
                        onChange={(e) => setFormData({ ...formData, profileUrl: e.target.value })}
                        className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 focus:outline-none focus:border-primary"
                        placeholder="https://twitter.com/yourhandle"
                      />
                    </div>
                  </>
                )}

                {editingPlatform === 'kaggle' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-2">Username</label>
                      <input
                        type="text"
                        value={formData.username || ''}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 focus:outline-none focus:border-primary"
                        placeholder="yourusername"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Profile URL</label>
                      <input
                        type="url"
                        value={formData.profileUrl || ''}
                        onChange={(e) => setFormData({ ...formData, profileUrl: e.target.value })}
                        className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 focus:outline-none focus:border-primary"
                        placeholder="https://kaggle.com/yourusername"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Tier</label>
                      <input
                        type="text"
                        value={formData.tier || ''}
                        onChange={(e) => setFormData({ ...formData, tier: e.target.value })}
                        className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 focus:outline-none focus:border-primary"
                        placeholder="Expert, Master, etc."
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Competitions</label>
                        <input
                          type="number"
                          value={formData.competitions || 0}
                          onChange={(e) => setFormData({ ...formData, competitions: parseInt(e.target.value) })}
                          className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 focus:outline-none focus:border-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Datasets</label>
                        <input
                          type="number"
                          value={formData.datasets || 0}
                          onChange={(e) => setFormData({ ...formData, datasets: parseInt(e.target.value) })}
                          className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 focus:outline-none focus:border-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Notebooks</label>
                        <input
                          type="number"
                          value={formData.notebooks || 0}
                          onChange={(e) => setFormData({ ...formData, notebooks: parseInt(e.target.value) })}
                          className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 focus:outline-none focus:border-primary"
                        />
                      </div>
                    </div>
                  </>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-2 bg-dark-bg hover:bg-dark-hover rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updateMutation.isPending}
                    className="flex-1 px-4 py-2 bg-primary hover:bg-primary-dark rounded-lg transition-colors disabled:opacity-50"
                  >
                    {updateMutation.isPending ? 'Updating...' : 'Update'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Brand
