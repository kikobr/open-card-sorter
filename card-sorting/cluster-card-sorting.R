library(ggplot2)
library(ggdendro)
library(corrplot)

getCardSortingClusters <- function(datasets){
  
  # getting all cards from all datasets
  cards <- c()
  for(i in 1:length(datasets)){
    ds <- datasets[[i]]
    if(!is.null(ds$file)){
      datasets[[i]]$data = read.csv(file=ds$file, header = T, sep = ",");
      for(v in datasets[[i]]$data){
        cards = c(cards, levels(v));
      }
    }
  }
  # getting unique cards and ignore empty cells
  cards = unique(cards[cards != ""])
  columns <- c("Name", "Cluster", cards)
  
  # creating "transaction" structure
  # see association rules: https://www.datacamp.com/community/tutorials/market-basket-analysis-r
  base_df = data.frame(matrix(NA, ncol=length(columns)))
  index_df = data.frame(matrix(NA, ncol=length(columns)))
  colnames(base_df) <- columns
  colnames(index_df) <- columns
  
  # transform data into the structure
  for(ds in datasets){
    # each ds$data is a cluster
    for(i in 1:length(ds$data)){
      v = ds$data[[i]]
      # test to see if variables vector matches mapped columns
      # first two columns are reserved to identifying cluster name
      row <- columns %in% v
      row[1] = ds$name
      row[2] = colnames(ds$data)[i]
      
      indexRow <- columns
      indexRow[1] = ds$name
      indexRow[2] = colnames(ds$data)[i]
      for(i in 1:length(cards)){
        card <- cards[[i]]
        # get index of card inside this cluster vector
        cardIndex <- match(c(card),v)
        # map card index to a 0 ~ 1 position based on v length
        index <- cardIndex / length(v)
        indexRow[i+2] = index
      }
      
      # transform variable's rows into columns
      df = data.frame(matrix(row, nrow=1))
      df_i = data.frame(matrix(indexRow, nrow=1))
      colnames(df) <- columns
      colnames(df_i) <- columns
      base_df = rbind(base_df, df)
      index_df = rbind(index_df, df_i)
    }
  }
  # remove NA rows
  base_df = base_df[complete.cases(base_df),]
  # remove first NA row
  index_df = index_df[-c(1),]
  
  # force logical and numeric type
  base_df[,3:length(base_df)] = as.logical(base_df[,3:length(base_df)] == "TRUE")
  
  # get "names" column, count repeated rows and table them per person
  # each row = 1 cluster per person. counting repeated rows for "names" equals counting each person's total clusters
  median_clusters = median(table(base_df[,1]))
  
  # measure "distance" between variables and fill matrix
  measure_df = base_df[,3:length(base_df)]
  measure_names = colnames(measure_df)
  conf_matrix = matrix(1, nrow = length(measure_df), ncol = length(measure_df))
  colnames(conf_matrix) = measure_names
  rownames(conf_matrix) = measure_names
  
  for(i in 1:length(measure_names)){
    first = measure_names[[i]]
    for (j in 1:length(measure_names)){
      second = measure_names[[j]]
      if(first != second){
        # calculate "distance" between the two
        #if(first == "Estado do veículo" && second == "Ano do veículo"){
        compare = measure_df[,c(first, second)]
        # count TRUE entries
        firstCount = length(which(compare[,1] == TRUE))
        secondCount = length(which(compare[,2] == TRUE))
        greaterCount = if(firstCount > secondCount) firstCount else secondCount
        bothCount = length(which(compare[,1] & compare[,2] == TRUE))
        
        # calculate "confidence" of this pair association
        # it's the same as calculating confidence for A THEN B and B THEN A, and then picking the smallest value
        conf = bothCount / greaterCount
        conf_matrix[i,j] <- conf
        conf_matrix[j,i] <- conf
      }
    }
  }
  # convert confidence to "distance": the smaller, the closer
  dist_matrix <- 1 - conf_matrix
  hclust <- hclust(as.dist(dist_matrix), method = 'average')

  res = list(
    cards = cards,
    hclust = hclust,
    dist_matrix = dist_matrix,
    conf_matrix = conf_matrix,
    base_df = base_df,
    index_df = index_df,
    median_clusters = median_clusters
  )
  return(res)
}

getClusterTable <- function(hclust=NULL, k=2, index_df=NULL){
  cut = cutree(hclust, k=k)
  # transform df from cutree (each row as a card with an assigned cluster) 
  # into multiple columns for each cluster
  cut_df = data.frame(cut)
  colnames(cut_df) <- c("Cluster")
  # create a column at the right with the card corresponding to the cluster on the left
  cut_df$Card = rownames(cut_df)
  rownames(cut_df) <- NULL
  # for each unique cluster, create a new column with the assined cards
  for(c in unique(cut_df$Cluster)){
    # get list of cards for this cluster number and complete vector with empty strings
    cards = cut_df[cut_df$Cluster == c, "Card"]
    # reorder cards base on their indexes
    if(!is.null(index_df)){
      # for each card, get their mode inside indexes dataframe
      for(i in 1:length(cards)){
        card <- cards[i]
        # get non-NA values from indexes dataframe
        indexes <- index_df[card][!is.na(index_df[card])]
        median_index <- median(as.numeric(indexes))
        median_index <- round(median_index, digits=1)
        cards[i] = paste(median_index, card)
      }
      cards = sort(cards)
    }
    cut_df[paste("Cluster ", c)] = c(cards, vector(mode="character", length =(nrow(cut_df)-length(cards)) ))
  }
  return(cut_df[,-c(1,2)])
}

getClustersPlot <- function(hclust, k=NULL){
  hcdata <- dendro_data_k(hclust, k)
  plot <- plot_ggdendro(
    hcdata,
    direction   = "lr", # horizontal
    # direction   = "tb", # vertical
    expand.y    = 0.5,
    label.size  = 4.5,
    branch.size = 1
  ) +
    theme_light() +
    ylab("Distance (the smaller, the closer)") +
    xlab("") +
    theme(panel.border = element_blank())+
    scale_fill_continuous(guide = guide_legend(title = NULL))
  return(plot)
}

getConfPlot <- function(conf_matrix){
  col <- colorRampPalette(c("blue", "white", "#27AE60"))
  return(
    corrplot(
      round(conf_matrix, digits = 1), 
      type="upper", 
      method="color", 
      # method="circle", 
      addgrid.col = alpha("#000000", 0.2),
      tl.col = "black", 
      tl.cex=0.8, 
      tl.srt=45, 
      number.cex = 0.7, 
      addCoef.col = "black",
      col=col(20), 
      cl.lim = c(0,1), 
      cl.cex=0.8
    )
  )
}